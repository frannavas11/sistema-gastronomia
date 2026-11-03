import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { DeliveryType, PaymentMethod } from "@/types/store";

interface OrderItemInput {
  product_id: string;
  quantity: number;
  selected_options?: Array<{
    id: string;
    group_id?: string;
  }>;
  notes?: string | null;
}

interface CreateOrderBody {
  store_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: DeliveryType;
  delivery_address?: string | null;
  payment_method: PaymentMethod;
  notes?: string | null;
  items: OrderItemInput[];
}

interface OptionWithGroup {
  id: string;
  name: string;
  price: number | null;
  is_available: boolean | null;
  group_id: string;
  product_option_groups: {
    id: string;
    store_id: string;
    product_id: string;
    name: string;
  } | null;
}

interface ProcessedOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  selected_options: {
    options: Array<{
      id: string;
      name: string;
      price: number;
      group_id: string;
      group_name: string;
    }>;
    notes: string;
  };
}

export async function POST(request: Request) {
  try {
    let body: CreateOrderBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Payload inválido. Se esperaba un JSON válido." },
        { status: 400 },
      );
    }

    // 1. Validaciones de presencia y formato básico
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Cuerpo de solicitud requerido." },
        { status: 400 },
      );
    }

    if (!body.store_id || typeof body.store_id !== "string") {
      return NextResponse.json(
        { error: "El campo store_id es obligatorio." },
        { status: 400 },
      );
    }

    const customerName =
      typeof body.customer_name === "string" ? body.customer_name.trim() : "";
    if (!customerName || customerName.length < 2) {
      return NextResponse.json(
        { error: "El nombre del cliente debe tener al menos 2 caracteres." },
        { status: 400 },
      );
    }

    const customerPhone =
      typeof body.customer_phone === "string" ? body.customer_phone.trim() : "";
    const cleanDigits = customerPhone.replace(/\D/g, "");
    if (!customerPhone || cleanDigits.length < 6) {
      return NextResponse.json(
        { error: "El teléfono del cliente debe tener al menos 6 dígitos válidos." },
        { status: 400 },
      );
    }

    if (body.delivery_type !== "delivery" && body.delivery_type !== "take_away") {
      return NextResponse.json(
        { error: "El tipo de entrega debe ser 'delivery' o 'take_away'." },
        { status: 400 },
      );
    }

    const deliveryAddress =
      typeof body.delivery_address === "string"
        ? body.delivery_address.trim()
        : "";
    if (body.delivery_type === "delivery" && (!deliveryAddress || deliveryAddress.length < 3)) {
      return NextResponse.json(
        { error: "La dirección de entrega es obligatoria para envíos a domicilio." },
        { status: 400 },
      );
    }

    const validPaymentMethods: PaymentMethod[] = ["cash", "transfer", "mercadopago"];
    if (!validPaymentMethods.includes(body.payment_method)) {
      return NextResponse.json(
        { error: "Método de pago no válido." },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "El pedido debe incluir al menos un producto." },
        { status: 400 },
      );
    }

    // Validar formato de cada ítem
    for (const item of body.items) {
      if (!item || typeof item !== "object") {
        return NextResponse.json(
          { error: "Formato de ítem inválido." },
          { status: 400 },
        );
      }
      if (!item.product_id || typeof item.product_id !== "string") {
        return NextResponse.json(
          { error: "Cada ítem debe tener un product_id válido." },
          { status: 400 },
        );
      }
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty <= 0 || qty > 100) {
        return NextResponse.json(
          { error: "La cantidad de cada producto debe ser un entero positivo (máx 100)." },
          { status: 400 },
        );
      }
    }

    // 2. Conectar a Supabase con service_role (bypasea RLS de forma segura en servidor)
    const supabase = createServiceClient();

    // 3. Consultar datos y estado del comercio
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id, name, is_open, delivery_cost, min_order_amount, phone_whatsapp")
      .eq("id", body.store_id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: "El comercio no existe o no se encuentra disponible." },
        { status: 404 },
      );
    }

    if (store.is_open === false) {
      return NextResponse.json(
        { error: "El comercio se encuentra actualmente cerrado y no recibe pedidos." },
        { status: 400 },
      );
    }

    // 4. Consultar en DB los productos vigentes para recalcular precios de servidor
    const productIds = Array.from(new Set(body.items.map((i) => i.product_id)));

    const { data: dbProducts, error: productsError } = await supabase
      .from("products")
      .select("id, name, base_price, is_active, is_available, store_id")
      .in("id", productIds)
      .eq("store_id", store.id);

    if (productsError || !dbProducts) {
      return NextResponse.json(
        { error: "Error al consultar productos en la base de datos." },
        { status: 500 },
      );
    }

    const productsMap = new Map(dbProducts.map((p) => [p.id, p]));

    for (const item of body.items) {
      const prod = productsMap.get(item.product_id);
      if (!prod) {
        return NextResponse.json(
          { error: "Uno o más productos no pertenecen a este comercio o no existen." },
          { status: 400 },
        );
      }
      if (prod.is_active === false || prod.is_available === false) {
        return NextResponse.json(
          { error: `El producto "${prod.name}" no está disponible actualmente.` },
          { status: 400 },
        );
      }
    }

    // 5. Consultar los grupos de opciones de los productos para validación estricta de variantes
    const { data: dbOptionGroups, error: optionGroupsError } = await supabase
      .from("product_option_groups")
      .select("id, product_id, store_id, name, is_required, max_selectable")
      .in("product_id", productIds)
      .eq("store_id", store.id);

    if (optionGroupsError || !dbOptionGroups) {
      return NextResponse.json(
        { error: "Error al consultar los grupos de opciones en la base de datos." },
        { status: 500 },
      );
    }

    type OptionGroupRow = {
      id: string;
      product_id: string;
      store_id: string;
      name: string;
      is_required: boolean | null;
      max_selectable: number | null;
    };

    const optionGroupsByProduct = new Map<string, OptionGroupRow[]>();
    for (const group of dbOptionGroups as OptionGroupRow[]) {
      const existing = optionGroupsByProduct.get(group.product_id) ?? [];
      existing.push(group);
      optionGroupsByProduct.set(group.product_id, existing);
    }

    // 6. Consultar en DB los modificadores/opciones seleccionadas
    const optionIds = Array.from(
      new Set(
        body.items.flatMap((item) =>
          (item.selected_options || []).map((opt) => opt.id).filter(Boolean),
        ),
      ),
    );

    const optionsMap = new Map<string, OptionWithGroup>();

    if (optionIds.length > 0) {
      const { data: dbOptions, error: optionsError } = await supabase
        .from("product_option_items")
        .select(`
          id,
          name,
          price,
          is_available,
          group_id,
          product_option_groups!inner (
            id,
            store_id,
            product_id,
            name
          )
        `)
        .in("id", optionIds);

      if (optionsError || !dbOptions) {
        return NextResponse.json(
          { error: "Error al consultar opciones y adicionales en la base de datos." },
          { status: 500 },
        );
      }

      for (const opt of dbOptions as unknown as OptionWithGroup[]) {
        optionsMap.set(opt.id, opt);
      }

      // Validar pertenencia, disponibilidad y correspondencia de producto
      for (const item of body.items) {
        for (const optRef of item.selected_options || []) {
          const dbOpt = optionsMap.get(optRef.id);
          if (!dbOpt) {
            return NextResponse.json(
              { error: "Una o más opciones seleccionadas no existen." },
              { status: 400 },
            );
          }
          if (dbOpt.product_option_groups?.store_id !== store.id) {
            return NextResponse.json(
              { error: "Una o más opciones no pertenecen a este comercio." },
              { status: 400 },
            );
          }
          if (dbOpt.product_option_groups?.product_id !== item.product_id) {
            return NextResponse.json(
              {
                error: `La opción "${dbOpt.name}" no corresponde al producto seleccionado.`,
              },
              { status: 400 },
            );
          }
          if (dbOpt.is_available === false) {
            return NextResponse.json(
              { error: `La opción "${dbOpt.name}" no se encuentra disponible.` },
              { status: 400 },
            );
          }
        }
      }
    }

    // 7. Validación estricta de variantes (is_required y max_selectable) por cada ítem
    for (const item of body.items) {
      const product = productsMap.get(item.product_id)!;
      const groups = optionGroupsByProduct.get(item.product_id) ?? [];
      const itemOptions = item.selected_options || [];

      // Conteo de opciones válidas por grupo para este ítem
      const countByGroup = new Map<string, number>();
      for (const optRef of itemOptions) {
        const dbOpt = optionsMap.get(optRef.id);
        if (dbOpt) {
          countByGroup.set(
            dbOpt.group_id,
            (countByGroup.get(dbOpt.group_id) ?? 0) + 1,
          );
        }
      }

      for (const group of groups) {
        const selectedCount = countByGroup.get(group.id) ?? 0;

        // Regla A: Si el grupo es obligatorio (is_required = true), debe haber al menos una opción
        if (group.is_required && selectedCount === 0) {
          return NextResponse.json(
            {
              error: `El grupo de opciones "${group.name}" en el producto "${product.name}" es obligatorio.`,
            },
            { status: 400 },
          );
        }

        // Regla B: Si define max_selectable, la cantidad no debe superar dicho límite
        if (
          group.max_selectable !== null &&
          group.max_selectable !== undefined &&
          group.max_selectable > 0 &&
          selectedCount > group.max_selectable
        ) {
          return NextResponse.json(
            {
              error: `El grupo "${group.name}" en el producto "${product.name}" permite como máximo ${group.max_selectable} ${
                group.max_selectable === 1 ? "opción" : "opciones"
              } (se seleccionaron ${selectedCount}).`,
            },
            { status: 400 },
          );
        }
      }
    }

    // 8. Recalcular subtotales y total con precios de la base de datos (seguridad estricta)
    let calculatedSubtotal = 0;
    const processedItems: ProcessedOrderItem[] = [];

    for (const item of body.items) {
      const dbProduct = productsMap.get(item.product_id)!;
      const quantity = Math.floor(Number(item.quantity));

      const itemOptions = (item.selected_options || []).map((optRef) => {
        const dbOpt = optionsMap.get(optRef.id)!;
        return {
          id: dbOpt.id,
          name: dbOpt.name,
          price: Number(dbOpt.price ?? 0),
          group_id: dbOpt.group_id,
          group_name: dbOpt.product_option_groups?.name ?? "",
        };
      });

      const optionsUnitPrice = itemOptions.reduce((sum, opt) => sum + opt.price, 0);
      const realUnitPrice = Number(dbProduct.base_price) + optionsUnitPrice;
      const itemSubtotal = realUnitPrice * quantity;

      calculatedSubtotal += itemSubtotal;

      processedItems.push({
        product_id: dbProduct.id,
        product_name: dbProduct.name,
        quantity,
        unit_price: realUnitPrice,
        subtotal: itemSubtotal,
        selected_options: {
          options: itemOptions,
          notes: typeof item.notes === "string" ? item.notes.trim() : "",
        },
      });
    }

    // Validar monto mínimo si aplica
    if (
      store.min_order_amount &&
      store.min_order_amount > 0 &&
      calculatedSubtotal < store.min_order_amount
    ) {
      return NextResponse.json(
        {
          error: `El pedido no alcanza el monto mínimo de compra ($${store.min_order_amount}).`,
        },
        { status: 400 },
      );
    }

    // Costo de envío según tipo de entrega
    const deliveryFee =
      body.delivery_type === "delivery" ? Number(store.delivery_cost ?? 0) : 0;
    const calculatedTotal = calculatedSubtotal + deliveryFee;

    // 7. Insertar en tabla `orders` (estado pending)
    const { data: newOrder, error: orderInsertError } = await supabase
      .from("orders")
      .insert({
        store_id: store.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_type: body.delivery_type,
        delivery_address:
          body.delivery_type === "delivery" ? deliveryAddress : null,
        delivery_fee: deliveryFee,
        payment_method: body.payment_method,
        notes:
          typeof body.notes === "string" && body.notes.trim()
            ? body.notes.trim()
            : null,
        status: "pending",
        subtotal: calculatedSubtotal,
        total: calculatedTotal,
      })
      .select("id")
      .single();

    if (orderInsertError || !newOrder) {
      console.error("Error al registrar pedido en orders:", orderInsertError);
      return NextResponse.json(
        { error: "Error al registrar el pedido en la base de datos." },
        { status: 500 },
      );
    }

    // 8. Insertar en tabla `order_items`
    const orderItemsToInsert = processedItems.map((item) => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
      selected_options: item.selected_options,
    }));

    const { error: itemsInsertError } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsInsertError) {
      console.error("Error al registrar ítems en order_items:", itemsInsertError);
      // Rollback del registro en orders para no dejar inconsistencias
      await supabase.from("orders").delete().eq("id", newOrder.id);
      return NextResponse.json(
        { error: "Error al registrar los ítems del pedido." },
        { status: 500 },
      );
    }

    // 9. Respuesta exitosa con ID público del pedido y totales recalculados
    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      subtotal: calculatedSubtotal,
      deliveryFee,
      total: calculatedTotal,
    });
  } catch (err) {
    console.error("Error inesperado en POST /api/orders:", err);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al procesar el pedido." },
      { status: 500 },
    );
  }
}

