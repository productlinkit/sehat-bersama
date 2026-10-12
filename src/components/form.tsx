import { useId, useState, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export const inputCls = 'h-12 rounded-xl bg-white text-base'

export interface FieldControlProps {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

/**
 * Label + control + helper text + inline error.
 * The label is bound with for/id; hint and error are linked via aria-describedby (WCAG 1.3.1, 3.3.1, 3.3.2, 4.1.2).
 */
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: (props: FieldControlProps) => ReactNode
}) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-semibold">
        {label}
      </Label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && (
        <p id={hintId} className="text-muted-foreground text-[13px]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

export function PasswordInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false)
  const { t } = useI18n()
  return (
    <div className="relative">
      <Input {...props} type={show ? 'text' : 'password'} className={cn(inputCls, 'pr-12', className)} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={t('Tampilkan kata sandi', 'Show password')}
        aria-pressed={show}
        aria-controls={props.id}
        className="text-muted-foreground absolute inset-y-0 right-1 my-auto grid size-10 place-items-center rounded-lg"
      >
        {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </div>
  )
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </p>
  )
}
