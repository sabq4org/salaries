import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, GripVertical } from "lucide-react";

interface Employee {
  id: number;
  name: string;
  position: string | null;
  baseSalary: number;
  socialInsurance: number;
  leaveBalance: number;
  sortOrder: number;
  isActive: boolean;
}

interface SortableRowProps {
  employee: Employee;
  index: number;
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
}

export function SortableRow({ employee, index, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: employee.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: 'transparent',
    borderTop: '1px solid #f0f0ef',
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-accent transition-colors">
      <td className="p-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      </td>
      <td className="p-4">
        <div className="flex flex-col">
          <span className="text-foreground font-medium">{employee.name}</span>
          <span className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full w-fit mt-1">
            {employee.leaveBalance} يوم إجازة
          </span>
        </div>
      </td>
      <td className="p-4 text-muted-foreground">{employee.position || '-'}</td>
      <td className="p-4 text-foreground">{employee.baseSalary.toLocaleString()} ر.س</td>
      <td className="p-4 text-foreground">{employee.socialInsurance.toLocaleString()} ر.س</td>
      <td className="p-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(employee)}
            className="hover:bg-blue-50"
          >
            <Pencil className="h-4 w-4" style={{ color: '#2563eb' }} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(employee.id)}
            className="hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" style={{ color: '#dc2626' }} />
          </Button>
        </div>
      </td>
    </tr>
  );
}
