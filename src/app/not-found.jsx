import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#05001f] text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(158,101,255,0.20),transparent_30%),radial-gradient(circle_at_top_left,rgba(0,153,255,0.12),transparent_20%),linear-gradient(135deg,#08153a_0%,#070028_38%,#040018_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] items-center px-6 py-10 lg:px-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[480px_minmax(0,1fr)] xl:grid-cols-[540px_minmax(0,1fr)]">
          {/* Left Illustration */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[430px]">
              <Image
                src="/illustration.png"
                alt="404 illustration"
                width={430}
                height={560}
                priority
                className="h-auto w-full object-contain"
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="max-w-[950px]">
            <h1 className="text-[88px] font-bold leading-none tracking-tight text-white/85 sm:text-[120px] md:text-[150px] xl:text-[180px]">
              404
            </h1>

            <h2 className="mt-2 text-3xl font-medium leading-tight tracking-[-0.03em] text-white sm:text-4xl md:text-5xl xl:text-[72px]">
              This page could not be found
            </h2>

            <p className="mt-8 max-w-[900px] text-lg leading-relaxed text-white/85 sm:text-2xl md:text-3xl xl:text-[34px]">
              You can either stay and chill here, or go back to the beginning.
            </p>

            <div className="mt-10">
              <Link
                href="/"
                className="inline-flex min-h-[64px] items-center justify-center rounded-full border border-white/70 px-10 text-lg font-semibold uppercase tracking-wide text-white transition duration-300 hover:bg-white hover:text-[#05001f] sm:px-12 sm:text-xl"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
