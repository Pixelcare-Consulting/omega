"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface TwoFactorSetupProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function TwoFactorSetup({ isOpen, onClose, onSuccess }: TwoFactorSetupProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'qr' | 'verify'>('qr')
  const [secret, setSecret] = useState<{ base32: string; qrCode: string } | null>(null)
  const [verificationCode, setVerificationCode] = useState('')

  const generateSecret = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/2fa/generate')
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setSecret(data)
      setStep('verify')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate 2FA secret",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyAndEnable = async () => {
    if (!verificationCode || !secret) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode, secret: secret.base32 }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled for your account.",
      })
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep('qr')
    setSecret(null)
    setVerificationCode('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Icons.shield className="h-5 w-5 text-primary" />
            <span>Two-Factor Authentication</span>
            <Badge variant="outline" className="ml-2 bg-primary/10">
              Recommended
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {step === 'qr' 
              ? "Enhance your account security by enabling two-factor authentication."
              : "Enter the verification code from your authenticator app to complete setup."}
          </DialogDescription>
        </DialogHeader>

        <div className="my-2">
          {step === 'qr' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="border-dashed">
                <CardContent className="pt-6 pb-4 px-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Icons.lock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Why use 2FA?</h4>
                      <p className="text-xs text-muted-foreground">
                        Two-factor authentication adds an additional layer of security to your account by requiring a second verification step.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Button 
                onClick={generateSecret}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Icons.qrCode className="mr-2 h-4 w-4" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center">
                <div className="mb-2 flex flex-col items-center">
                  <p className="text-sm font-medium mb-2">Scan this QR code with your authenticator app</p>
                  {secret?.qrCode && (
                    <div className="relative aspect-square w-40 overflow-hidden rounded-lg border p-2 bg-white">
                      <Image
                        src={secret.qrCode}
                        alt="2FA QR Code"
                        width={160}
                        height={160}
                        priority
                      />
                    </div>
                  )}
                </div>
                
                <div className="w-full mt-2">
                  <div className="rounded-md bg-muted p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Or manually enter this code in your app:
                      </p>
                      <div className="flex items-center justify-between">
                        <code className="relative rounded bg-background px-[0.5rem] py-[0.2rem] font-mono text-xs text-ellipsis overflow-hidden max-w-[80%]">
                          {secret?.base32}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(secret?.base32 || '')
                            toast({
                              title: "Copied",
                              description: "Secret key copied to clipboard",
                            })
                          }}
                        >
                          <Icons.copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 pt-2">
                    <p className="text-sm">Enter the 6-digit verification code:</p>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={6}
                      className="text-center text-base tracking-widest"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className={cn("gap-2 sm:gap-0 pt-4", step === 'verify' && "sm:space-x-2")}>
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          {step === 'verify' && (
            <Button
              onClick={verifyAndEnable}
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.check className="mr-2 h-4 w-4" />
              )}
              Verify and Enable
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 