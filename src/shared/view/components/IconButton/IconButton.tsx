import { forwardRef, type Ref } from 'react';
import { IconButton as MUIIconButton, type IconButtonProps } from '@mui/material';

type Props = Omit<IconButtonProps, 'disableRipple' | 'style'> & { dataTest?: string };

const IconButton = forwardRef(
  ({ dataTest, size = 'large', ...restProps }: Props, ref: Ref<HTMLButtonElement>) => (
    <MUIIconButton
      data-test={dataTest}
      style={{ borderRadius: '8px' }}
      ref={ref}
      size={size}
      disableRipple
      {...restProps}
    />
  ),
);

export { IconButton };
