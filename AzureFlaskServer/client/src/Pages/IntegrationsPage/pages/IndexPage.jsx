import AnimatedBeamSingleOutput from "@/Components/magicui/animated-beam-single-output";
import { BentoCard, BentoGrid } from "@/Components/magicui/bento-grid";

const features = [
  {
    name: "Jira",
    description: "Integrate with Jira to create issues from calls.",
    href: "jira",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <AnimatedBeamSingleOutput
        iconName="jira"
        className="absolute right-2 top-4 h-[300px] w-[600px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105"
      />
    ),
  },
  {
    name: "Gmail",
    description: "Integrate with Gmail to send emails from copilot.",
    href: "gmail",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <AnimatedBeamSingleOutput
        iconName="gmail"
        className="absolute right-2 top-4 h-[300px] w-[600px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105"
      />
    ),
  },
  {
    name: "Telegram",
    description: "Coming soon...",
    href: "transcriber",
    cta: "Coming soon...",
    className: "col-span-3 lg:col-span-1",
    background: (
      <AnimatedBeamSingleOutput
        iconName="telegram"
        className="absolute right-2 top-4 h-[300px] w-[600px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105"
      />
    ),
  },
  {
    name: "Whatsapp",
    description: "Coming soon...",
    href: "",
    cta: "Coming soon...",
    className: "col-span-3 lg:col-span-1",
    background: (
      <AnimatedBeamSingleOutput
        iconName="whatsapp"
        className="absolute right-2 top-4 h-[300px] w-[600px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105"
      />
    ),
  },
  {
    name: "Google Sheets",
    description: "Coming soon...",
    className: "col-span-3 lg:col-span-1",
    href: "",
    cta: "Coming soon...",
    background: (
      <AnimatedBeamSingleOutput
        iconName="sheets"
        className="absolute right-2 top-4 h-[300px] w-[600px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105"
      />
    ),
  },
  {
    name: "Notion",
    description: "Coming soon...",
    className: "col-span-3 lg:col-span-1",
    href: "",
    cta: "Coming soon...",
    background: (
      <AnimatedBeamSingleOutput
        iconName="notion"
        className="absolute right-2 top-4 h-[300px] w-[600px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105"
      />
    ),
  },
  {
    name: "Messenger",
    description: "Coming soon...",
    className: "col-span-3 lg:col-span-1",
    href: "",
    cta: "Coming soon...",
    background: (
      <AnimatedBeamSingleOutput
        iconName="messenger"
        className="absolute right-2 top-4 h-[300px] w-[600px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105"
      />
    ),
  },
  {
    name: "Google Drive",
    description: "Coming soon...",
    className: "col-span-3 lg:col-span-1",
    href: "",
    cta: "Coming soon...",
    background: (
      <AnimatedBeamSingleOutput
        iconName="googleDrive"
        className="absolute right-2 top-4 h-[300px] w-[600px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105"
      />
    ),
  },
];

export default function IndexPage() {
  return (
    <div className="flex flex-col pt-[70px] items-center overflow-scroll [mask-image:linear-gradient(to_bottom,transparent_5%,#000_10%)]">
      <BentoGrid>
        {features.map((feature, idx) => (
          <BentoCard key={idx} {...feature} />
        ))}
      </BentoGrid>
    </div>
  );
}
