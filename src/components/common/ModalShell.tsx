import { Modal } from '@heroui/react';
import type { ReactNode } from 'react';

type ModalShellProps = {
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function ModalShell({ children, isOpen, onOpenChange }: ModalShellProps) {
  const setOpen = (nextOpen: boolean) => onOpenChange(nextOpen);
  const open = () => onOpenChange(true);
  const close = () => onOpenChange(false);
  const toggle = () => onOpenChange(!isOpen);

  return (
    <Modal state={{ isOpen, setOpen, open, close, toggle }}>
      <Modal.Backdrop>
          <Modal.Container className="w-[min(96vw,920px)]" placement="auto" scroll="inside" size="lg">
          <Modal.Dialog>
            {children}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
