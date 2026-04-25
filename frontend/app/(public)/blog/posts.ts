export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: { name: string; role: string; initials: string };
  tag: string;
  tagColor: string;
  cover: { gradient: string; emoji: string };
  body: { type: "p" | "h2" | "h3" | "ul" | "quote" | "code"; content: string | string[] }[];
};

export const POSTS: BlogPost[] = [
  {
    slug: "ai-spending-predictions-explained",
    title: "How SpendWise predicts your spending before it happens",
    excerpt:
      "We built a linear regression model on three months of historical data. Here's exactly how it works — and why it's right 87% of the time.",
    date: "2026-04-12",
    readTime: "6 min",
    author: { name: "Aarav Krishnan", role: "Founding Engineer", initials: "AK" },
    tag: "Engineering",
    tagColor: "#6C63FF",
    cover: { gradient: "from-[#6C63FF] to-[#A78BFA]", emoji: "🧠" },
    body: [
      { type: "p", content: "Most expense trackers show you what you spent. SpendWise tells you what you're going to spend. Here's how the prediction engine actually works under the hood." },
      { type: "h2", content: "The setup" },
      { type: "p", content: "When you log expenses for at least 30 days, we have enough data to fit a per-category linear regression. We treat days-since-month-start as the X axis and cumulative spend as Y. The slope of that line is your daily burn rate, and projecting it to month-end gives the forecast." },
      { type: "h2", content: "Why linear regression?" },
      { type: "p", content: "We tested ARIMA, exponential smoothing, and a tiny LSTM. For 30-day windows with weekly seasonality, plain old least-squares regression with a weekend dummy variable beat all of them on RMSE. Simpler also means we can run it on-device in <50ms." },
      { type: "h3", content: "Anomaly detection" },
      { type: "p", content: "Separately, we compute a z-score on each new expense relative to your category history. Anything above 2.5 standard deviations gets flagged as 'unusual'. This is what surfaces alerts like 'You spent 3x your usual on transport this week'." },
      { type: "quote", content: "The goal isn't to be a black-box AI. It's to make small, explainable predictions you can actually trust and act on." },
      { type: "h2", content: "Results so far" },
      { type: "p", content: "Across the first 12,000 students, our forecasts land within ±8% of the actual month-end total 87% of the time. The ones we miss are usually 'lifestyle shock' months — moving hostels, festival spending, etc. We're working on detecting those upfront." },
    ],
  },
  {
    slug: "designing-for-broke-college-students",
    title: "Designing a finance app for broke college students",
    excerpt:
      "Why we threw out every convention from banking apps and built something that feels closer to Duolingo than to a ledger.",
    date: "2026-04-04",
    readTime: "5 min",
    author: { name: "Riya Bhatt", role: "Design Lead", initials: "RB" },
    tag: "Design",
    tagColor: "#00D4AA",
    cover: { gradient: "from-[#00D4AA] to-[#34D399]", emoji: "🎨" },
    body: [
      { type: "p", content: "When we started SpendWise, the brief was simple: 'don't make it look like Yono.' Banking apps are designed for 35-year-old account managers. We had to design for 19-year-olds who are tracking ₹40 chai expenses." },
      { type: "h2", content: "Three design rules" },
      { type: "ul", content: ["Sub-5-second flows for everything frequent. Every extra tap is a tax on habit formation.", "Dark by default. Students live on their phones at night and bright UIs are jarring.", "Gamification, but not patronizing. Real milestones, not vanity counters."] },
      { type: "h2", content: "Color & feel" },
      { type: "p", content: "Our palette is deliberately closer to a music app than a finance app. Deep navy backgrounds, electric purple primary, mint green for positive states. Every accent is high-contrast on dark — never beige, never corporate." },
      { type: "h3", content: "The badge system" },
      { type: "p", content: "We have 16 badges, each tied to a real behavior. 'Week Warrior' for 7-day streaks. 'Budget Keeper' for staying under-limit. 'Wealth Architect' for the elite few. They're rare on purpose — easy badges feel like spam." },
    ],
  },
  {
    slug: "why-we-dont-link-bank-accounts",
    title: "Why we don't link to your bank account",
    excerpt:
      "Account aggregators are a great idea on paper. In practice, manual logging is faster, more accurate, and forces a behavior change that automation can't.",
    date: "2026-03-22",
    readTime: "4 min",
    author: { name: "Dushyant Sharma", role: "Founder", initials: "DS" },
    tag: "Product",
    tagColor: "#FFB347",
    cover: { gradient: "from-[#FFB347] to-[#FF6B6B]", emoji: "🔒" },
    body: [
      { type: "p", content: "Every time we demo SpendWise, someone asks: 'why don't you just connect to my bank?' It's the single biggest objection — and we keep choosing not to." },
      { type: "h2", content: "Three reasons" },
      { type: "h3", content: "1. Account Aggregator coverage is incomplete" },
      { type: "p", content: "AA APIs cover most banks but miss UPI peer-to-peer, cash, and most wallets. For students, those are 60% of transactions. An incomplete picture is worse than no picture — it gives false confidence." },
      { type: "h3", content: "2. Manual logging changes behavior" },
      { type: "p", content: "When you have to type ₹240 for Swiggy, you feel it. Studies on financial behavior consistently show that the friction of manual entry creates awareness — and awareness is what drives saving. Automation removes that signal entirely." },
      { type: "h3", content: "3. Privacy" },
      { type: "p", content: "We never want to be a target for credential theft. By not storing bank linkages, we have nothing valuable to leak. Your data stays narrow, encrypted, and entirely yours." },
      { type: "quote", content: "The best finance app is the one that makes you think about your money — not the one that thinks for you." },
    ],
  },
  {
    slug: "campus-money-survey-2026",
    title: "What 12,000 college students told us about their money",
    excerpt:
      "We surveyed our user base on hostel costs, mess fees, festival spending, and side hustles. The numbers might surprise you.",
    date: "2026-03-08",
    readTime: "8 min",
    author: { name: "Sneha Kapoor", role: "Data Lead", initials: "SK" },
    tag: "Research",
    tagColor: "#A78BFA",
    cover: { gradient: "from-[#A78BFA] to-[#6C63FF]", emoji: "📊" },
    body: [
      { type: "p", content: "We ran an opt-in survey across our user base in February 2026. 4,180 students from 117 campuses responded. Here's what we learned about how Indian college students actually spend." },
      { type: "h2", content: "The headlines" },
      { type: "ul", content: ["Median monthly spend (excluding tuition): ₹14,200", "Top category by far: Food & beverage at 41% of total spend", "Median UPI transactions per month: 67", "% reporting they 'always run out before month-end': 58%"] },
      { type: "h2", content: "The surprising bits" },
      { type: "p", content: "Subscription stacks are massive. The average respondent has 4.2 active subscriptions — Spotify, Netflix, ChatGPT Plus, JioHotstar topping the list — for a combined ₹890/month. That's a hostel mess fee in some places." },
      { type: "h3", content: "Side hustles are huge" },
      { type: "p", content: "37% of respondents reported some form of income outside pocket money. Freelance design, content creation, tutoring, and small e-commerce dominated. Median side income: ₹3,400/month." },
      { type: "p", content: "We'll be diving deeper into each segment over the coming weeks. If you want to be in the next round, opt-in is in Settings." },
    ],
  },
];

export function getPostBySlug(slug: string) {
  return POSTS.find((p) => p.slug === slug) ?? null;
}
