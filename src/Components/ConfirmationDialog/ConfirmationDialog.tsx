import { Button, Dialog, DialogBody, DialogFooter, DialogHeader } from '@material-tailwind/react';
import React, { memo, ReactNode } from 'react';

interface ConfirmationDialogProps {
  openDialog: boolean;
  handleOpen: () => void;
  title: string;
  message: string | ReactNode;
  handleConfirm: () => void;
  loading?: boolean;
  size?: boolean;
}

const ConfirmationDialog = memo<ConfirmationDialogProps>((props) => {
  const { openDialog, handleOpen, title, message, handleConfirm, loading = false, size = true } = props;

  return (
    <Dialog open={openDialog} handler={handleOpen} size={size ? "xs" : "md"} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} onResize={undefined} onResizeCapture={undefined}>
      <DialogHeader className='justify-center text-[20px]' placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} onResize={undefined} onResizeCapture={undefined}>{title}</DialogHeader>
      <hr className="border-t border-gray-300" />
      <DialogBody className='text-center text-[15px]' placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} onResize={undefined} onResizeCapture={undefined}>{message}</DialogBody>
      <DialogFooter className='flex justify-center items-center gap-2' placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} onResize={undefined} onResizeCapture={undefined}>
        <Button className='bg-[#F55E67] px-4 py-2 font-normal' onClick={handleOpen} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} onResize={undefined} onResizeCapture={undefined}>
          Cancel
        </Button>
        <Button className='mr-2 bg-[#3DA5F4] py-2 px-4 font-normal' onClick={handleConfirm} loading={loading} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} onResize={undefined} onResizeCapture={undefined}>
          {loading ? 'Loading' : 'Confirm'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
});

ConfirmationDialog.displayName = 'ConfirmationDialog';

export default ConfirmationDialog;

