import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 24, md: 32, lg: 48 };

export function Logo({ size = 'md' }: LogoProps) {
  const px = sizes[size];
  return (
    <Image src="/logo.svg" alt="Bitcoin Treasury Solutions" width={px} height={px} />
  );
}
