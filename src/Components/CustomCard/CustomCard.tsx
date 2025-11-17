import React from 'react';

interface CustomCardProps {
  image: string;
  alt: string;
  title: string;
  backgroundColor: string;
  count: number | string;
  link?: string;
}

const CustomCard: React.FC<CustomCardProps> = (props) => {
    const {image, alt, title, backgroundColor, count, link} = props;
  return (
    <>
    <div className='relative'>
    <div className='w-[170px] rounded-lg bg-white shadow-md'>
          <div className='p-4'>
            <div className='w-[130px] h-[120px]' >
              <img src={image} alt={alt}></img>
            </div>
          </div>
        </div>
        <div>
          <span className='absolute bottom-[94%] left-[80%] px-[8px] rounded-lg text-[11px] text-white font-semibold' style={{ backgroundColor: backgroundColor }}>
            {count}
          </span>

        </div>
        <span className='text-[14px] font-semibold'>{title}</span>
        
    </div>
    </>
  );
};

export default CustomCard;

