import type { ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout'
import { AuthProvider, RequireAuth } from '@/lib/auth'
import { ForgotPasswordPage, LoginPage, RegisterPage } from '@/pages/auth'
import {
  AccountPage,
  AddressesPage,
  DisplaySettingsPage,
  HelpPage,
  NotificationSettingsPage,
  PrivacyPage,
  ProfilePage,
  SecurityPage,
  TermsPage,
  TransactionsPage,
} from '@/pages/account'
import { CheckoutPage, PaymentSuccessPage } from '@/pages/checkout'
import { TextSizeProvider } from '@/lib/prefs'
import { I18nProvider, useI18n } from '@/lib/i18n'
import { ConsultationPage, PrescriptionsPage } from '@/pages/consultation'
import { HomePage } from '@/pages/home'
import { LegaChatPage, LegaPage } from '@/pages/lega'
import { PackagesPage } from '@/pages/packages'
import { ArticleDetailPage, ArticlesPage, HistoryPage, NotificationsPage, SearchPage } from '@/pages/records'
import { FunnelPage } from '@/pages/internal'
import { RewardPage } from '@/pages/reward'
import { ConsultationStartPage, HomeServicesPage, TriagePage } from '@/pages/services'

const p = (el: ReactNode) => <RequireAuth>{el}</RequireAuth>

function NotFound() {
  const { t } = useI18n()
  return (
    <AppShell nav={false}>
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <h1 className="text-primary text-6xl font-extrabold">404</h1>
          <p className="text-muted-foreground mt-2">{t('Halaman tidak ditemukan.', 'Page not found.')}</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/home">{t('Kembali ke Beranda', 'Back to Home')}</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  )
}

export default function App() {
  return (
    <I18nProvider>
    <AuthProvider>
      <TextSizeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            {/* Public: guests can browse services, packages, articles, help and try Lega */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/triage" element={<TriagePage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/home-services" element={<HomeServicesPage />} />
            <Route path="/lega" element={<LegaPage />} />
            <Route path="/lega/chat" element={<LegaChatPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/article/:slug" element={<ArticleDetailPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />
            {/* Signed-in */}
            <Route path="/checkout" element={p(<CheckoutPage />)} />
            <Route path="/payment/success" element={p(<PaymentSuccessPage />)} />
            <Route path="/consultation/start" element={p(<ConsultationStartPage />)} />
            <Route path="/consultation" element={p(<ConsultationPage />)} />
            <Route path="/prescriptions" element={p(<PrescriptionsPage />)} />
            <Route path="/history" element={p(<HistoryPage />)} />
            <Route path="/notifications" element={p(<NotificationsPage />)} />
            <Route path="/reward" element={p(<RewardPage />)} />
            <Route path="/account" element={p(<AccountPage />)} />
            <Route path="/account/profile" element={p(<ProfilePage />)} />
            <Route path="/account/addresses" element={p(<AddressesPage />)} />
            <Route path="/account/transactions" element={p(<TransactionsPage />)} />
            <Route path="/account/security" element={p(<SecurityPage />)} />
            <Route path="/account/display" element={p(<DisplaySettingsPage />)} />
            <Route path="/account/notifications" element={p(<NotificationSettingsPage />)} />
            <Route path="/internal/funnel" element={<FunnelPage />} />
            {/* Old paths */}
            <Route path="/notes" element={<Navigate to="/history" replace />} />
            <Route path="/account/help" element={<Navigate to="/help" replace />} />
            <Route path="/account/terms" element={<Navigate to="/terms" replace />} />
            <Route path="/account/privacy" element={<Navigate to="/privacy-policy" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </TextSizeProvider>
    </AuthProvider>
    </I18nProvider>
  )
}
