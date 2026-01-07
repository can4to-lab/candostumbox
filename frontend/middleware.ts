import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');

  // Eğer giriş yapılan adres "onrender.com" içeriyorsa
  if (host && host.includes('onrender.com')) {
    // Yeni adresi oluştur (candostumbox.com + gidilen sayfa yolu)
    const newUrl = new URL(`https://candostumbox.com${request.nextUrl.pathname}`);
    
    // 301 (Kalıcı) Yönlendirme yap
    return NextResponse.redirect(newUrl, 301);
  }

  return NextResponse.next();
}

// Bu kuralın tüm sayfalarda çalışmasını sağla
export const config = {
  matcher: '/:path*',
};