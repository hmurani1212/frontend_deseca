import { useRef } from 'react';

export const useDebounce = <T extends (...args: any[]) => Promise<any>>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
    const timer = useRef<NodeJS.Timeout | null>(null);

    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        if (timer.current) {
            clearTimeout(timer.current);
        }
        return new Promise<ReturnType<T>>((resolve) => {
            timer.current = setTimeout(async () => {
                const result = await callback(...args);
                resolve(result);
            }, delay);
        });
    };
};

