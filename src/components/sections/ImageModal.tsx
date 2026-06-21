import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface ImageModalProps {
  /** Whether the lightbox is open. */
  open: boolean
  /** Called when the open state changes (overlay click, Escape, close button). */
  onOpenChange: (open: boolean) => void
  imageSrc: string
  imageAlt: string
  className?: string
}

/**
 * ImageModal is a lightbox built on the shadcn `Dialog`. The Dialog primitive
 * supplies the overlay, Escape-to-close, focus trap, and close button; this
 * component only renders the enlarged image and its caption.
 *
 * NOTE: Unlike the page-band sections, this is a Dialog overlay, not an
 * in-flow page band — it deliberately does not compose `Section` or expose an
 * `id` anchor.
 */
export function ImageModal({
  open,
  onOpenChange,
  imageSrc,
  imageAlt,
  className,
}: ImageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('max-w-5xl p-2', className)}
        data-testid="image-modal"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{imageAlt}</DialogTitle>
          <DialogDescription>{imageAlt}</DialogDescription>
        </DialogHeader>
        <img
          src={imageSrc}
          alt={imageAlt}
          className="max-h-[80vh] w-full rounded-md object-contain"
        />
        <p className="pb-1 text-center text-sm text-muted-foreground">
          {imageAlt}
        </p>
      </DialogContent>
    </Dialog>
  )
}
