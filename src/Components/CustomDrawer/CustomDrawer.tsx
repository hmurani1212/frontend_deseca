import { Drawer, IconButton, Typography } from '@material-tailwind/react';
import React, { useEffect, useState, ReactNode } from 'react';
import ReactDOM from 'react-dom';

interface CustomDrawerProps {
  open: boolean;
  closeDrawer: () => void;
  compo: ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  title?: string;
  widthSize?: string;
  customImg?: boolean;
  image?: string;
}

const CustomDrawer: React.FC<CustomDrawerProps> = (props) => {
  const { 
    open, 
    closeDrawer, 
    compo, 
    direction = "right", 
    title, 
    widthSize = '45vw', 
    customImg = false, 
    image 
  } = props;
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  
  // Track toast presence to avoid accidental drawer close while interacting with toasts
  useEffect(() => {
    const checkForToasts = () => {
      const toasts = document.querySelectorAll('.Toastify__toast');
      setIsToastVisible(toasts.length > 0);
    };

    checkForToasts();
    const interval = setInterval(checkForToasts, 100);
    return () => clearInterval(interval);
  }, []);

  const handleDrawerClose = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (isToastVisible) {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      return;
    }
    closeDrawer();
  };

  return ReactDOM.createPortal(
    <Drawer 
      open={open} 
      onClose={handleDrawerClose}
      className="px-4 py-2 customDrwerScroll h-full overflow-auto max-w-[620px]"
      placement={direction}
      size={widthSize as any}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      placeholder={undefined}
      onResize={undefined}
      onResizeCapture={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
    >
      <div className="flex items-center justify-between px-[0.10vw] pt-[1.1vw]">
        {customImg ? 
          <img src={image} alt="logo" height={30} width={130} />
          :
          <Typography variant="h5" color="blue-gray" className='text-[1.2vw]' placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} onResize={undefined} onResizeCapture={undefined}>
            {title}
          </Typography>
        }
        <IconButton variant="text" color="blue-gray" onClick={closeDrawer} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} onResize={undefined} onResizeCapture={undefined}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </IconButton>
      </div>
      <hr className='mb-2' />
      <div>
        {compo}
      </div>
    </Drawer>,
    document.body
  );
};

export default CustomDrawer;

