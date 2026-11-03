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

  // Estado para agregar un ítem dentro de un grupo (mapeado por groupId)
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
        setError(res.error || "No se pudieron cargar las variantes.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar variantes");
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
    if (!confirm(`¿Estás seguro de eliminar el grupo "${groupName}" y todas sus opciones?`)) {
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

  const formatPrice = (amount: number) => {
    if (amount === 0) return "Sin costo adicional";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white border border-zinc-700/60 inline-flex items-center gap-1.5 transition-colors"
        title="Gestionar grupos de opciones y adicionales"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
        <span>Opciones</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">
                    Opciones y Variantes
                  </h3>
                  <p className="text-xs text-zinc-400 truncate max-w-sm">
                    {productName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500">
                  <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                  <span className="text-xs">Cargando opciones del producto...</span>
                </div>
              ) : groups.length === 0 && !showAddGroup ? (
                <div className="py-10 text-center rounded-2xl bg-zinc-950/60 border border-zinc-800/80 p-6">
                  <SlidersHorizontal className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-zinc-300">
                    Sin grupos de opciones configurados
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto mb-4">
                    Podés agregar grupos como &ldquo;Tamaño&rdquo;, &ldquo;Salsas&rdquo; o &ldquo;Adicionales&rdquo; para que el cliente elija al comprar.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddGroup(true)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white inline-flex items-center gap-1.5 transition-colors"
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
                      className="rounded-2xl bg-zinc-950/70 border border-zinc-800 p-4 space-y-3"
                    >
                      {/* Grupo Cabecera */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-zinc-100">
                            {group.name}
                          </h4>
                          {group.is_required ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              Obligatorio
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                              Opcional
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400">
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
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 inline-flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-rose-400" />
                            Agregar opción
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(group.id, group.name)}
                            className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Eliminar grupo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Formulario desplegable para agregar ítem a este grupo */}
                      {activeAddItemGroupId === group.id && (
                        <form
                          onSubmit={(e) => handleCreateItem(e, group.id)}
                          className="p-3 rounded-xl bg-zinc-900 border border-zinc-700/80 grid grid-cols-1 sm:grid-cols-12 gap-2 animate-in fade-in"
                        >
                          <div className="sm:col-span-6">
                            <input
                              type="text"
                              required
                              placeholder="Nombre de la opción (ej. Cheddar)"
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
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
                              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            />
                          </div>
                          <div className="sm:col-span-2 flex items-center gap-1">
                            <button
                              type="submit"
                              disabled={creatingItem}
                              className="flex-1 py-1.5 px-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center transition-colors"
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
                              className="p-1.5 text-zinc-500 hover:text-zinc-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Lista de Opciones del Grupo */}
                      {group.items.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic pl-1">
                          No hay opciones en este grupo todavía. Hacé clic en &ldquo;Agregar opción&rdquo;.
                        </p>
                      ) : (
                        <div className="divide-y divide-zinc-800/60 rounded-xl bg-zinc-900/60 border border-zinc-850 overflow-hidden">
                          {group.items.map((item) => (
                            <div
                              key={item.id}
                              className="px-3 py-2 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    item.is_available ? "bg-emerald-500" : "bg-rose-500"
                                  }`}
                                />
                                <span
                                  className={`font-medium truncate ${
                                    item.is_available
                                      ? "text-zinc-200"
                                      : "text-zinc-500 line-through"
                                  }`}
                                >
                                  {item.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-zinc-400">
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
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                    item.is_available
                                      ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  }`}
                                >
                                  {item.is_available ? "Pausar" : "Activar"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-zinc-500 hover:text-rose-400 transition-colors"
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

                  {/* Botón / Formulario para crear un nuevo grupo */}
                  {showAddGroup ? (
                    <form
                      onSubmit={handleCreateGroup}
                      className="p-4 rounded-2xl bg-zinc-950 border border-rose-500/40 space-y-3 animate-in fade-in"
                    >
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                        Nuevo Grupo de Opciones
                      </h4>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                            Nombre del Grupo
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Tamaño de la Pizza, Salsas, Puntos de cocción"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newGroupRequired}
                              onChange={(e) => setNewGroupRequired(e.target.checked)}
                              className="rounded border-zinc-700 text-rose-500 focus:ring-rose-500"
                            />
                            <div className="text-left">
                              <span className="block text-xs font-semibold text-zinc-200">
                                Selección obligatoria
                              </span>
                              <span className="block text-[10px] text-zinc-400">
                                El cliente debe elegir al menos una opción
                              </span>
                            </div>
                          </label>

                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                              Máximo de opciones seleccionables
                            </label>
                            <input
                              type="number"
                              min="1"
                              placeholder="1 = Radio único, o vacío para ilimitadas"
                              value={newGroupMaxSelectable}
                              onChange={(e) =>
                                setNewGroupMaxSelectable(e.target.value)
                              }
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setShowAddGroup(false)}
                          className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={creatingGroup}
                          className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white flex items-center gap-1.5 transition-colors"
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
                      className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-rose-400" />
                      Agregar otro grupo de opciones
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
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
