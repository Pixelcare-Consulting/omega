'use client'

import { useRouter } from 'nextjs-toploader/app';
import { Button, ButtonProps } from './ui/button'

type BackButtonProps = Pick<ButtonProps, 'className' | 'variant' | 'children'> & { href?: string }

export default function BackButton({ className, href, variant, children }: BackButtonProps) {
  const router = useRouter()

  function handleClick(href?: string) {
    if (href) {
      router.push(href)
      return
    }

    router.back()
  }

  return (
    <Button className={className} variant={variant} onClick={() => handleClick(href)}>
      {children}
    </Button>
  )
}
