import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import AnimatedBeamMultipleOutputDemo from "@/components/magicui/animated-beam-multiple-outputs";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import Marquee from "@/components/magicui/marquee";
import {
  BotMessageSquareIcon,
  MessagesSquareIcon,
  Share2Icon,
  WorkflowIcon,
} from "lucide-react";
import WordFadeIn from "@/Components/magicui/word-fade-in";
import AiMessage from "../TranscriberPage/Components/ai-message";

const files = [
  {
    name: "GetLatestSales",
    body: "This action will fetch the latest sales data from the database and return it in a structured format.",
  },
  {
    name: "GetLatestLeads",
    body: "This action will fetch the latest leads data from the database and return it in a structured format.",
  },
  {
    name: "GetLatestCustomers",
    body: "This action will fetch the latest customers data from the database and return it in a structured format.",
  },
  {
    name: "GetLatestOrders",
    body: "This action will fetch the latest orders data from the database and return it in a structured format.",
  },
  {
    name: "GetLatestProducts",
    body: "This action will fetch the latest products data from the database and return it in a structured format.",
  },
  {
    name: "GetLatestInvoices",
    body: "This action will fetch the latest invoices data from the database and return it in a structured format.",
  },
  {
    name: "GetLatestPayments",
    body: "This action will fetch the latest payments data from the database and return it in a structured format.",
  },
];

const demoAIMessages = [
  "TikTok Ads Manager is a platform where you can create and manage ads on TikTok. You can launch ads and measure performance with TikTok ads manager.",
  "TikTok Ads Manager account allows you to create targeted ads with Video Creation Kit, generate insight reports about your ads and automate the process of creating, delivering, and optimizing your ads with the Automated Creative Optimization tool.",
  "You can set a daily or lifetime budget that can be changed anytime throughout your campaign. A bid indicates the maximum you will pay for the actions you want users to take after they see your ads. Learn more about TikTok Ads Bidding & Optimization.",
];

let notifications = [
  {
    name: "Payment received",
    description: "Magic UI",
    time: "15m ago",

    icon: "💸",
    color: "#00C9A7",
  },
  {
    name: "User signed up",
    description: "Magic UI",
    time: "10m ago",
    icon: "👤",
    color: "#FFB800",
  },
  {
    name: "New message",
    description: "Magic UI",
    time: "5m ago",
    icon: "💬",
    color: "#FF3D71",
  },
  {
    name: "New event",
    description: "Magic UI",
    time: "2m ago",
    icon: "🗞️",
    color: "#1E86FF",
  },
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

const Notification = ({ name, description, icon, color, time }) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] transform cursor-pointer overflow-hidden rounded-2xl p-4",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

const features = [
  {
    Icon: WorkflowIcon,
    name: "Actions",
    description: "Customise your copilot with actions.",
    href: "actions",
    cta: "Add Actions",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] "
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-40 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white ">
                  {f.name}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: MessagesSquareIcon,
    name: "Transcriber",
    description: "Enhance your calls with real-time transcription.",
    href: "transcriber",
    cta: "Transcribe now",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute right-10 top-10 w-[70%] origin-top translate-x-0 border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:-translate-x-10">
        <AiMessage points={demoAIMessages} />
      </div>
    ),
  },
  {
    Icon: Share2Icon,
    name: "Integrations",
    description: "Supports 100+ integrations and counting.",
    href: "integrations",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedBeamMultipleOutputDemo className="absolute right-2 top-4 h-[300px] w-[600px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
  {
    Icon: BotMessageSquareIcon,
    name: "Copilot",
    description: "Enhance your productivity with Copilot AI.",
    className: "col-span-3 lg:col-span-1",
    href: "copilot",
    cta: "Try Copilot",
    background: (
      <div className="absolute right-10 top-10 w-[70%] h-[70%] overflow-scroll origin-top rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-105">
        <AiMessage points={demoAIMessages} />
      </div>
    ),
  },
];

export default function DashboardPage() {
  return (
    <div className="h-full overflow-scroll">
      <div className="flex flex-col justify-start m-10">
        <WordFadeIn
          words="Welcome, Tristan Tan 👋"
          className="text-4xl md:text-4xl font-bold text-primary mb-10 text-left"
        />
        <BentoGrid>
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}
