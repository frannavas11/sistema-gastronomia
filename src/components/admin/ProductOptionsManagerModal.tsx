"use client";

import { useState, useCallback } from "react";
import {
  SlidersHorizontal,
  X,
  Plus,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  Layers,
} from "lucide-react";
import {
  getProductOptionGroups,
  createOptionGroup,
  deleteOptionGroup,
  createOptionItem,
  deleteOptionItem,
  toggleOptionItemAvailability,
} from "@/app/admin/actions";
import { formatCurrencyARS } from "@/lib/format";

interface OptionItem {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  group_id: string;
}

interface OptionGroup {
  id: string;
  name: string;
  is_required: boolean;
  max_selectable: number | null;
  product_id: string;
  store_id: string;
  items: OptionItem[];
}

interface ProductOptionsManagerModalProps {
  storeId: string;
  productId: string;
  productName: string;
}

export function ProductOptionsManagerModal({
  storeId,
  productId,
  productName,
}: ProductOptionsManagerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<OptionGroup[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Estado para crear un nuevo grupo
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupRequired, setNewGroupRequired] = useState(false);
  const [newGroupMaxSelectable, setNewGroupMaxSelectable] = useState<string>("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Estado para agregar un ítem dentro de un grupo
  const [activeAddItemGroupId, setActiveAddItemGroupId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [creatingItem, setCreatingItem] = useState(false);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProductOptionGroups(storeId, productId);
      if (res.success) {
        setGroups(res.groups);
      } else {
        setError(res.error || "No se pudieron cargar las opciones.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar opciones");
    } finally {
      setLoading(false);
    }
  }, [storeId, productId]);

  const handleOpen = () => {
    setIsOpen(true);
    loadGroups();
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setCreatingGroup(true);
    setError(null);

    const maxSelectableNum = newGroupMaxSelectable.trim()
      ? parseInt(newGroupMaxSelectable, 10)
      : null;

    try {
      const res = await createOptionGroup({
        storeId,
        productId,
        name: newGroupName.trim(),
        isRequired: newGroupRequired,
        maxSelectable: maxSelectableNum && maxSelectableNum > 0 ? maxSelectableNum : null,
      });

      if (!res.success) {
        setError(res.error || "Error al crear grupo.");
      } else {
        setNewGroupName("");
        setNewGroupRequired(false);
        setNewGroupMaxSelectable("");
        setShowAddGroup(false);
        await loadGroups();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el grupo "${groupName}" y sus opciones?`)) {
      return;
    }

    try {
      const res = await deleteOptionGroup({ storeId, groupId });
      if (!res.success) {
        setError(res.error || "Error al eliminar grupo.");
      } else {
        await loadGroups();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const handleCreateItem = async (e: React.FormEvent, groupId: string) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setCreatingItem(true);
    setError(null);

    const priceNum = parseFloat(newItemPrice) || 0;

    try {
      const res = await createOptionItem({
        storeId,
        groupId,
        name: newItemName.trim(),
        price: priceNum,
      });

      if (!res.success) {
        setError(res.error || "Error al crear opción.");
      } else {
        setNewItemName("");
        setNewItemPrice("");
        setActiveAddItemGroupId(null);
        await loadGroups();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setCreatingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const res = await deleteOptionItem({ storeId, itemId });
      if (!res.success) {
        setError(res.error || "Error al eliminar opción.");
      } else {
        await loadGroups();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const handleToggleItemAvailability = async (itemId: string, current: boolean) => {
    try {
      const res = await toggleOptionItemAvailability({
        storeId,
        itemId,
        newIsAvailable: !current,
      });

      if (!res.success) {
        setError(res.error || "Error al cambiar disponibilidad.");
      } else {
        setGroups((prev) =>
          prev.map((g) => ({
            ...g,
            items: g.items.map((i) =>
              i.id === itemId ? { ...i, is_available: !current } : i,
            ),
          })),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  const formatPrice = (amount: number) => (amount === 0 ? "Sin costo" : formatCurrencyARS(amount));

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface hover:bg-surface-2 text-text-primary border border-border shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        title="Gestionar grupos de opciones y adicionales"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-brand-fg" />
        <span>Opciones</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade"
        >
          <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden text-text-primary">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-text-primary">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    Opciones y Variantes
                  </h3>
                  <p className="text-xs text-text-secondary truncate max-w-sm">
                    {productName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-2 text-text-tertiary hover:text-text-primary flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-error-soft border border-error-border text-error text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-error" />
                  <span>{error}</span>
                </div>
              )}

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-tertiary">
                  <Loader2 className="w-5 h-5 animate-spin text-text-secondary" />
                  <span className="text-xs">Cargando opciones...</span>
                </div>
              ) : groups.length === 0 && !showAddGroup ? (
                <div className="py-8 text-center rounded-xl bg-background border border-border p-6">
                  <SlidersHorizontal className="w-7 h-7 text-text-tertiary mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-text-primary">
                    Sin grupos de opciones configurados
                  </h4>
                  <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto mb-4">
                    Podés agregar grupos como &ldquo;Tamaño&rdquo;, &ldquo;Salsas&rdquo; o &ldquo;Adicionales&rdquo; para que el cliente elija al comprar.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddGroup(true)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-ink hover:bg-ink/90 text-ink-contrast inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Crear primer grupo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className="rounded-xl bg-background border border-border p-4 space-y-3"
                    >
                      {/* Grupo Cabecera */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-text-primary">
                            {group.name}
                          </h4>
                          {group.is_required ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-error-soft text-error border border-error-border">
                              Obligatorio
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-border text-text-secondary">
                              Opcional
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-border/80 text-text-secondary">
                            {group.max_selectable === 1
                              ? "Selección única"
                              : group.max_selectable
                              ? `Máx. ${group.max_selectable}`
                              : "Múltiples opciones"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveAddItemGroupId(
                                activeAddItemGroupId === group.id ? null : group.id,
                              );
                              setNewItemName("");
                              setNewItemPrice("");
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface hover:bg-surface-2 text-text-primary border border-border inline-flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-text-secondary" />
                            Agregar opción
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(group.id, group.name)}
                            className="p-1 rounded-lg text-text-tertiary hover:text-error hover:bg-error-soft transition-colors"
                            title="Eliminar grupo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Formulario para agregar ítem a este grupo */}
                      {activeAddItemGroupId === group.id && (
                        <form
                          onSubmit={(e) => handleCreateItem(e, group.id)}
                          className="p-3 rounded-lg bg-surface border border-border-strong grid grid-cols-1 sm:grid-cols-12 gap-2"
                        >
                          <div className="sm:col-span-6">
                            <input
                              type="text"
                              required
                              placeholder="Nombre de la opción (ej. Cheddar)"
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              className="w-full px-3 py-1.5 bg-surface border border-border-strong rounded-lg text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-brand"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <input
                              type="number"
                              min="0"
                              step="50"
                              placeholder="Precio extra ($)"
                              value={newItemPrice}
                              onChange={(e) => setNewItemPrice(e.target.value)}
                              className="w-full px-3 py-1.5 bg-surface border border-border-strong rounded-lg text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-brand tabular-nums"
                            />
                          </div>
                          <div className="sm:col-span-2 flex items-center gap-1">
                            <button
                              type="submit"
                              disabled={creatingItem}
                              className="flex-1 py-1.5 px-2 bg-ink hover:bg-ink/90 disabled:opacity-50 text-ink-contrast rounded-lg text-xs font-medium flex items-center justify-center transition-colors"
                            >
                              {creatingItem ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Guardar"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveAddItemGroupId(null)}
                              className="p-1.5 text-text-tertiary hover:text-text-primary"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Lista de Opciones del Grupo */}
                      {group.items.length === 0 ? (
                        <p className="text-xs text-text-tertiary italic pl-1">
                          No hay opciones en este grupo todavía. Hacé clic en &ldquo;Agregar opción&rdquo;.
                        </p>
                      ) : (
                        <div className="divide-y divide-border rounded-lg bg-surface border border-border overflow-hidden">
                          {group.items.map((item) => (
                            <div
                              key={item.id}
                              className="px-3 py-2 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.is_available ? "bg-success-solid" : "bg-border-strong"
                                  }`}
                                />
                                <span
                                  className={`font-medium truncate ${
                                    item.is_available
                                      ? "text-text-primary"
                                      : "text-text-tertiary line-through"
                                  }`}
                                >
                                  {item.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-text-secondary tabular-nums">
                                  {formatPrice(item.price)}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleItemAvailability(
                                      item.id,
                                      item.is_available,
                                    )
                                  }
                                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                                    item.is_available
                                      ? "bg-surface-2 hover:bg-border text-text-primary"
                                      : "bg-error-soft text-error border border-error-border"
                                  }`}
                                >
                                  {item.is_available ? "Pausar" : "Activar"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-text-tertiary hover:text-error transition-colors"
                                  title="Eliminar opción"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Formulario / Botón para crear nuevo grupo */}
                  {showAddGroup ? (
                    <form
                      onSubmit={handleCreateGroup}
                      className="p-4 rounded-xl bg-background border border-border-strong space-y-3"
                    >
                      <h4 className="text-xs font-bold text-text-primary">
                        Nuevo Grupo de Opciones
                      </h4>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-text-primary mb-1">
                            Nombre del Grupo
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Tamaño, Salsas, Puntos de cocción"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border-strong rounded-lg text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-brand"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <label className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newGroupRequired}
                              onChange={(e) => setNewGroupRequired(e.target.checked)}
                              className="rounded border-border-strong text-text-primary focus:ring-brand"
                            />
                            <div className="text-left">
                              <span className="block text-xs font-medium text-text-primary">
                                Selección obligatoria
                              </span>
                              <span className="block text-[10px] text-text-secondary">
                                El cliente debe elegir al menos una
                              </span>
                            </div>
                          </label>

                          <div>
                            <label className="block text-xs font-medium text-text-primary mb-1">
                              Máximo seleccionable
                            </label>
                            <input
                              type="number"
                              min="1"
                              placeholder="1 = Único, o vacío para ilimitadas"
                              value={newGroupMaxSelectable}
                              onChange={(e) =>
                                setNewGroupMaxSelectable(e.target.value)
                              }
                              className="w-full px-3 py-2 bg-surface border border-border-strong rounded-lg text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-brand"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                        <button
                          type="button"
                          onClick={() => setShowAddGroup(false)}
                          className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary font-medium"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={creatingGroup}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-ink hover:bg-ink/90 disabled:opacity-50 text-ink-contrast flex items-center gap-1.5 transition-colors"
                        >
                          {creatingGroup ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Crear Grupo
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddGroup(true)}
                      className="w-full py-2.5 px-4 rounded-xl border border-dashed border-border-strong hover:border-text-tertiary text-xs font-medium text-text-secondary hover:text-text-primary flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-text-secondary" />
                      Agregar otro grupo de opciones
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-surface-2 hover:bg-border text-text-primary transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
