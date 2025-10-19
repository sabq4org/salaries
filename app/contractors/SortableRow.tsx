import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, GripVertical } from "lucide-react";

interface Contractor {
  id: number;
  name: string;
  position: string | null;
  salary: number;
  sortOrder: number;
  isActive: boolean;
}

interface SortableRowProps {
  contractor: Contractor;
  index: number;
  onEdit: (contractor: Contractor) => void;
  onDelete: (id: number) => void;
}

export function SortableRow({ contractor, index, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: contractor.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
    borderTop: '1px solid #f0f0ef',
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-accent transition-colors">
      <td className="p-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      </td>
      <td className="p-4 text-foreground font-medium">{contractor.name}</td>
      <td className="p-4 text-muted-foreground">{contractor.position || '-'}</td>
      <td className="p-4 text-foreground">{contractor.salary.toLocaleString()} ر.س</td>
      <td className="p-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(contractor)}
            className="hover:bg-blue-50"
          >
            <Pencil className="h-4 w-4" style={{ color: '#2563eb' }} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(contractor.id)}
            className="hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" style={{ color: '#dc2626' }} />
          </Button>
        </div>
      </td>
    </tr>
  );
}
