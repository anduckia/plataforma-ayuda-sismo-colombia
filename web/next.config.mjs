/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // La cara pública no sube imágenes ni usa el optimizador: menos peso, menos
  // dependencias y menos que pueda fallar con mala señal.
  images: { unoptimized: true },
};

export default nextConfig;
