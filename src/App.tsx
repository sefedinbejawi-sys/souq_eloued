import { Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { BottomNav } from './components/layout/BottomNav';
import { Toast } from './components/layout/Toast';
import { Modals } from './components/modals/Modals';
import { HomePage } from './pages/HomePage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AboutPage, ContactPage, PrivacyPage, TermsPage } from './pages/LegalPages';
import { AdminPage } from './pages/AdminPage';
import { AuthConfirmedPage } from './pages/AuthConfirmedPage';

export default function App() {
  return <AppProvider>
    <div dir="rtl" className="min-h-screen bg-[#f7f8fa] pb-16 text-slate-900 md:pb-0">
      <Header/>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/listing/:id" element={<ListingDetailPage/>} />
        <Route path="/about" element={<AboutPage/>} />
        <Route path="/contact" element={<ContactPage/>} />
        <Route path="/terms" element={<TermsPage/>} />
        <Route path="/privacy" element={<PrivacyPage/>} />
        <Route path="/admin" element={<AdminPage/>} />
        <Route path="/auth/confirmed" element={<AuthConfirmedPage/>} />
        <Route path="*" element={<NotFoundPage/>} />
      </Routes>
      <Footer/>
      <BottomNav/>
      <Modals/>
      <Toast/>
    </div>
  </AppProvider>;
}
