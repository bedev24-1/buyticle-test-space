/* Icônes dessinées à la main : pas de dépendance, pas de police distante,
   et un trait identique partout. */
const S = ({ children, w = 17 }) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

export const IcMove   = (p) => <S {...p}><path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/></S>;
export const IcGrid   = (p) => <S {...p}><rect x="3" y="3" width="7" height="18" rx="1.6"/><rect x="13" y="3" width="8" height="8" rx="1.6"/><rect x="13" y="14" width="8" height="7" rx="1.6"/></S>;
export const IcCap    = (p) => <S {...p}><path d="M2 8l10-4 10 4-10 4z"/><path d="M6 10v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/></S>;
export const IcTrend  = (p) => <S {...p}><path d="M3 17l6-6 4 4 8-8"/><path d="M21 7v5h-5"/></S>;
export const IcTree   = (p) => <S {...p}><rect x="9" y="3" width="6" height="5" rx="1.4"/><rect x="2" y="16" width="6" height="5" rx="1.4"/><rect x="16" y="16" width="6" height="5" rx="1.4"/><path d="M12 8v4M5 16v-2h14v2"/></S>;
export const IcAlert  = (p) => <S {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></S>;
export const IcGear   = (p) => <S {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 14a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1v.2a2 2 0 11-4 0v-.1a1.6 1.6 0 00-2.8-1.1l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 004 14a2 2 0 010-4 1.6 1.6 0 001.1-2.7l-.1-.1a2 2 0 112.8-2.8l.1.1A1.6 1.6 0 0010 4.6V4a2 2 0 114 0v.1A1.6 1.6 0 0016.7 5l.1-.1a2 2 0 112.8 2.8l-.1.1A1.6 1.6 0 0020 10a2 2 0 010 4z"/></S>;
export const IcSearch = (p) => <S {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></S>;
export const IcChat   = (p) => <S {...p}><path d="M21 12a8 8 0 01-8 8H7l-4 3v-4.5A8 8 0 1121 12z"/></S>;
export const IcBell   = (p) => <S {...p}><path d="M18 8a6 6 0 10-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M13.7 20a2 2 0 01-3.4 0"/></S>;
export const IcShare  = (p) => <S {...p}><path d="M12 15V3M12 3L8 7M12 3l4 4"/><path d="M4 14v5a2 2 0 002 2h12a2 2 0 002-2v-5"/></S>;
export const IcChev   = (p) => <S {...p}><path d="M9 5l7 7-7 7"/></S>;
export const IcInfo   = (p) => <S {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/></S>;
export const IcUp     = (p) => <S {...p}><path d="M4 16l6-6 4 4 6-7"/><path d="M20 11V7h-4"/></S>;
export const IcCheck  = (p) => <S {...p}><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></S>;
export const IcRun    = (p) => <S {...p}><path d="M12 3a9 9 0 109 9"/><path d="M12 7v5l3 2"/></S>;
export const IcPlus   = (p) => <S {...p}><path d="M12 5v14M5 12h14"/></S>;
export const IcPlay   = (p) => <S {...p}><path d="M7 4l12 8-12 8z"/></S>;
export const IcDown   = (p) => <S {...p}><path d="M12 3v13M12 16l-4-4M12 16l4-4"/><path d="M4 20h16"/></S>;
export const IcBack   = (p) => <S {...p}><path d="M15 5l-7 7 7 7"/></S>;
export const IcLock   = (p) => <S {...p}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 118 0v3"/></S>;
export const IcTarget = (p) => <S {...p}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/></S>;
export const IcOut    = (p) => <S {...p}><path d="M14 3h5a2 2 0 012 2v14a2 2 0 01-2 2h-5"/><path d="M10 17l-5-5 5-5M5 12h11"/></S>;
