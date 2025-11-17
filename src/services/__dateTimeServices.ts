export const convertDMY = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-GB');
};

export const convertTimeAMPM = (timestamp: number | string): string => {
  if (timestamp === "0") {
    return "";
  }
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const toUnixTimeStamp = (timestamp: string | number | Date): number => {
  const date = new Date(timestamp);
  const unixTimestamp = Math.floor(date.getTime() / 1000);
  return unixTimestamp;
};

export const formatDateYMD = (dateString: number): string => {
    const date = new Date(dateString * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatTimestampToDate = (timestamp: number | string | null | undefined): string => {
    if (!timestamp || timestamp === 0) {
        return 'N/A';
    }
    
    try {
        const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp * 1000);
        
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (error) {
        // console.error('Error formatting timestamp:', error);
        return 'Invalid Date';
    }
};

export function formatDateDMY(timestamp: number | string | null | undefined): string {
    if (!timestamp) return 'N/A';
    
    if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Invalid Date';
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }
    
    const date = new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

export function formatDateDM(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    return `${day} ${month}`;
}

export const formatTimestampToTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${hours}:${minutesFormatted} ${ampm}`;
};

export const formatTimestampToTimeSeconds = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
    
    return formattedTime;
};

export const secondsIntoHrs = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  let timeString = '';

  if (hours > 0) {
    timeString += `${hours} Hour${hours > 1 ? 's' : ''}`;
  }

  if (minutes > 0) {
    if (hours > 0) timeString += ', ';
    timeString += `${minutes} Mint${minutes > 1 ? 's' : ''}`;
  }

  return timeString || '0 Min';
};

export const unixToDMY = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const formattedDate = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  return formattedDate;
};

const getDaySuffix = (day: number): string => {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export const getFormattedDate = (): string => {
  const date = new Date();
  
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = days[date.getDay()];

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = months[date.getMonth()];

  const day = date.getDate();
  const daySuffix = getDaySuffix(day);

  const year = date.getFullYear();

  return `${dayName} ${day}${daySuffix} of ${monthName} ${year}`;
};

export const formatTimeTo12Hour = (timeString: string | null | undefined): string => {
  if (!timeString || typeof timeString !== 'string') {
    return '-';
  }
  
  const timeParts = timeString.split(':');
  if (timeParts.length !== 2) {
    return timeString;
  }
  
  const [hour, minute] = timeParts.map(Number);
  
  if (isNaN(hour) || isNaN(minute)) {
    return timeString;
  }
  
  const ampm = hour >= 12 ? 'pm' : 'am';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

