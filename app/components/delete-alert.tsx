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
import { useState } from 'react';
import { useToast } from './ui/use-toast';
import { useRouter } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default function DeleteAlert({
  deleteAction,
  sessionId,
  userId,
}: {
  deleteAction: Function;
  sessionId: string;
  userId: string;
}) {
  const [show, setShow] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  return (
    <AlertDialog open={show} onOpenChange={setShow}>
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
            onClick={async () => {
              console.log(sessionId, userId);
              const res = await deleteAction({ sessionId, userId });
              console.log(res);
              if (!res?.ok) {
                toast({
                  variant: 'destructive',
                  className:
                    'bg-destructive border-destructive hover:brightness-90',
                  title: 'Error',
                  description: 'Something went wrong',
                });
                return;
              }
              setShow(false);
              // invalidate the cache

              toast({
                title: 'Success',
                description: 'Session deleted successfully',
              });
              router.refresh();
              router.push('/');
            }}
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
