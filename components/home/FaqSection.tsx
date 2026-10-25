import React from 'react';
import { DEFAULT_FAQS, FAQItem } from '@/components/seo/JsonLd';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface FaqSectionProps {
  faqs?: FAQItem[];
}

/**
 * Server-Rendered FAQ Section (AEO & LLM Citation Engineered)
 * Uses native semantic HTML details/summary elements to ensure zero hydration delay
 * and guaranteed extraction by PerplexityBot, GPTBot, and Google AI Overviews.
 */
export default function FaqSection({ faqs = DEFAULT_FAQS }: FaqSectionProps) {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-16 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2
            id="faq-heading"
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white"
          >
            Common Questions About EduWonder Notes & Exams
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Everything you need to know about curriculum coverage, PDF access, and test security.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 open:shadow-md transition-all duration-200"
              {...(index === 0 ? { open: true } : {})}
            >
              <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                <span className="pr-4">{faq.question}</span>
                <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 group-hover:text-violet-600 transition-all">
                  <ChevronDown className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" />
                </span>
              </summary>
              <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
