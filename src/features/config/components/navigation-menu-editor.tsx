import { ArrowDown, ArrowUp, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { SystemConfig } from "@/features/config/config.schema";
import {
  NAV_MENU_ACCESS_TYPES,
  NAV_MENU_ITEM_TYPES,
  NAVIGATION_MENU_MAX_DEPTH,
  type NavigationMenuItem,
} from "@/features/config/site-config.schema";
import { m } from "@/paraglide/messages";

type MenuListKey = "main" | "postsIndex";

function createEmptyMenuItem(): NavigationMenuItem {
  return {
    id: "",
    title: "",
    type: "internal",
    access: "public",
    to: "/",
    url: "",
    anchorId: "",
    visible: true,
    children: [],
  };
}

function typeLabel(type: (typeof NAV_MENU_ITEM_TYPES)[number]) {
  switch (type) {
    case "internal":
      return m.settings_nav_type_internal();
    case "external":
      return m.settings_nav_type_external();
    case "anchor":
      return m.settings_nav_type_anchor();
    default:
      return type;
  }
}

function accessLabel(access: (typeof NAV_MENU_ACCESS_TYPES)[number]) {
  switch (access) {
    case "public":
      return m.settings_nav_access_public();
    case "authenticated":
      return m.settings_nav_access_authenticated();
    case "admin":
      return m.settings_nav_access_admin();
    default:
      return access;
  }
}

function MenuItemEditor({
  path,
  depth,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  path: string;
  depth: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const { register, control, watch } = useFormContext<SystemConfig>();
  const currentType = watch(`${path}.type` as never) as unknown as
    | "internal"
    | "external"
    | "anchor"
    | undefined;
  const canAddChildren = depth < NAVIGATION_MENU_MAX_DEPTH - 1;
  const {
    fields: childFields,
    append: appendChild,
    move: moveChild,
    remove: removeChild,
  } = useFieldArray({
    control,
    name: `${path}.children` as never,
  });

  return (
    <div className="space-y-3 rounded-lg border border-border/30 bg-background/30 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_160px_160px_auto] items-end">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            {m.settings_nav_field_id()}
          </label>
          <Input
            {...register(`${path}.id` as never)}
            placeholder="posts-main"
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            {m.settings_nav_field_title()}
          </label>
          <Input
            {...register(`${path}.title` as never)}
            placeholder="Posts"
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            {m.settings_nav_field_type()}
          </label>
          <select
            {...register(`${path}.type` as never)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {NAV_MENU_ITEM_TYPES.map((type) => (
              <option key={type} value={type}>
                {typeLabel(type)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            {m.settings_nav_field_access()}
          </label>
          <select
            {...register(`${path}.access` as never)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {NAV_MENU_ACCESS_TYPES.map((access) => (
              <option key={access} value={access}>
                {accessLabel(access)}
              </option>
            ))}
          </select>
        </div>
        <div className="h-9 inline-flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground transition-colors enabled:hover:bg-muted/50 enabled:hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={m.settings_nav_move_up()}
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground transition-colors enabled:hover:bg-muted/50 enabled:hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={m.settings_nav_move_down()}
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-destructive"
            aria-label={m.settings_nav_remove_item()}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {currentType === "internal" && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {m.settings_nav_field_to()}
            </label>
            <Input
              {...register(`${path}.to` as never)}
              placeholder="/posts"
              className="h-9"
            />
          </div>
        )}

        {currentType === "external" && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {m.settings_nav_field_url()}
            </label>
            <Input
              {...register(`${path}.url` as never)}
              placeholder="https://example.com"
              className="h-9"
            />
          </div>
        )}

        {currentType === "anchor" && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {m.settings_nav_field_anchor()}
            </label>
            <Input
              {...register(`${path}.anchorId` as never)}
              placeholder="category-go"
              className="h-9"
            />
          </div>
        )}

        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground mt-5">
          <input
            type="checkbox"
            {...register(`${path}.visible` as never)}
            className="h-4 w-4 rounded border-border"
          />
          {m.settings_nav_field_visible()}
        </label>
      </div>

      {canAddChildren && (
        <div className="space-y-3 rounded-md border border-border/20 bg-muted/10 p-3">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <ChevronRight size={14} />
            {m.settings_nav_children()}
          </div>

          {childFields.length > 0 && (
            <div className="space-y-3">
              {childFields.map((child, childIndex) => (
                <MenuItemEditor
                  key={child.id}
                  path={`${path}.children.${childIndex}`}
                  depth={depth + 1}
                  canMoveUp={childIndex > 0}
                  canMoveDown={childIndex < childFields.length - 1}
                  onMoveUp={() => moveChild(childIndex, childIndex - 1)}
                  onMoveDown={() => moveChild(childIndex, childIndex + 1)}
                  onRemove={() => removeChild(childIndex)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => appendChild(createEmptyMenuItem() as never)}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={14} />
            {m.settings_nav_add_child()}
          </button>
        </div>
      )}
    </div>
  );
}

function MenuListEditor({
  menuKey,
  title,
  description,
}: {
  menuKey: MenuListKey;
  title: string;
  description: string;
}) {
  const { control } = useFormContext<SystemConfig>();
  const { fields, append, move, remove } = useFieldArray({
    control,
    name: `site.navigation.${menuKey}` as never,
  });

  return (
    <div className="space-y-3 rounded-lg border border-border/30 bg-background/20 p-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {fields.length > 0 && (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <MenuItemEditor
              key={field.id}
              path={`site.navigation.${menuKey}.${index}`}
              depth={0}
              canMoveUp={index > 0}
              canMoveDown={index < fields.length - 1}
              onMoveUp={() => move(index, index - 1)}
              onMoveDown={() => move(index, index + 1)}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => append(createEmptyMenuItem() as never)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus size={16} />
        {m.settings_nav_add_item()}
      </button>
    </div>
  );
}

export function NavigationMenuEditor() {
  return (
    <div className="space-y-6">
      <MenuListEditor
        menuKey="main"
        title={m.settings_nav_main_title()}
        description={m.settings_nav_main_desc()}
      />
      <MenuListEditor
        menuKey="postsIndex"
        title={m.settings_nav_posts_title()}
        description={m.settings_nav_posts_desc()}
      />
    </div>
  );
}
