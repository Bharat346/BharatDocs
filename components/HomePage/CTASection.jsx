import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function CTASection({ theme }) {
  const isDark = theme === "dark";

  /* =========================
    Email Handler
  ========================= */
  const openEmail = () => {
    const email = "bharat030406@gmail.com";
    const subject = encodeURIComponent("Project Inquiry");
    const body = encodeURIComponent(
      "Hi Bharat,\n\nI would like to discuss a project with you.\n\nThanks!"
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = mailtoUrl;
      return;
    }

    const win = window.open(gmailUrl, "_blank", "noopener,noreferrer");

    if (!win) {
      window.location.href = mailtoUrl;
    }
  };

  return (
    <section
      className={`
        relative overflow-hidden py-20 sm:py-24 lg:py-28
        ${isDark
          ? "bg-gradient-to-b from-b-950 to-gray-900"
          : "bg-gradient-to-b from-gray-50 to-white"}
      `}
    >
      

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {/* Glass card */}
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-blue-500/30 to-emerald-500/20">
            <div
              className={`
                rounded-3xl backdrop-blur-xl shadow-xl
                px-6 py-10 sm:px-10 sm:py-12 lg:px-14
                ${isDark
                  ? "bg-gray-900/85 border border-gray-800 text-white"
                  : "bg-white/90 border border-gray-200 text-gray-900"}
              `}
            >
              {/* Heading */}
              <h2 className="text-center font-roboto tracking-tight text-3xl sm:text-4xl lg:text-5xl">
                Let’s Build Something
                <span className="block mt-2 bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                  Exceptional Together
                </span>
              </h2>

              {/* Description */}
              <p
                className={`
                  mt-5 sm:mt-6 text-center max-w-2xl mx-auto
                  text-base sm:text-lg font-mono
                  ${isDark ? "text-gray-300" : "text-gray-600"}
                `}
              >
                Questions, ideas, or opportunities? I’d love to hear from you
                and help you get the most out of Bharat Docs.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={openEmail}
                  className="
                    group w-full sm:w-auto px-8 py-6
                    text-base sm:text-lg font-semibold rounded-xl
                    text-white bg-gradient-to-r from-blue-600 to-blue-700
                    hover:from-blue-500 hover:to-blue-600
                    shadow-lg hover:shadow-blue-500/25 transition-all
                  "
                >
                  <Mail className="w-5 h-5 mr-3 group-hover:-translate-y-0.5 transition-transform font-mono" />
                  Email Me
                </Button>

                <Link href="https://portfolio.bhdocs.in" target="_blank">
                  <Button
                    variant="outline"
                    size="lg"
                    className={`
                      group w-full sm:w-auto px-8 py-6
                      text-base sm:text-lg font-semibold rounded-xl
                      transition-all
                      ${isDark
                        ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"}
                    `}
                  >
                    <ExternalLink className="font-mono w-5 h-5 mr-3 opacity-80" />
                    View Portfolio
                    <ChevronRight className="font-mono w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Footer */}
              <div
                className={`
                  mt-10 sm:mt-12 pt-6 sm:pt-8 border-t
                  ${isDark ? "border-gray-800" : "border-gray-200"}
                `}
              >
                <p className="text-center text-[11px] sm:text-xs uppercase tracking-widest text-gray-500 font-mono">
                  Bharat • Full Stack Developer • React & Next.js
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
