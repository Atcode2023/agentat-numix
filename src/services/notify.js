import { Notify } from 'quasar';

export const handleMessages = ({ message, color, icon }) => {
  Notify.create({
    message: `${message}`,
    html: true,
    textColor: 'white',
    icon: icon,
    color: color,
  });
};
