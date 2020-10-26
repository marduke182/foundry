export const errorOnce = (err: string) => {
  const showed = 0;
  return () => {
    if (!showed) {
      ui.notifications.error(err);
    }
  };
};
