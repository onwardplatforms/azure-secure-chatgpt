import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';

export default function DeleteAlert() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'outlineDestructive'} className="hover:text-white">
          <TrashIcon className="mr-2 w-4 h-4 hover:stroke-white" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Session Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this session? This action cannot be
            undone, and all messages within this session will be permanently
            removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="bg-destructive border-destructive hover:brightness-90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
