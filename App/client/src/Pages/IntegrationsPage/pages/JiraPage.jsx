import AnimatedGridPattern from "@/Components/magicui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import JiraLogo from "@/assets/jira.svg";
import { LinkPreview } from "@/Components/ui/link-preview";

export default function JiraPage() {
  return (
    <div className="max-h-screen overflow-y-scroll">
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.5}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          "inset-x-[20%] h-screen skew-y-12"
        )}
      />
      <div className="flex flex-col justify-start gap-y-5 w-[98%]">
        <h2 className="text-3xl font-semibold text-primary border-b pb-2">
          Jira Integration Setup Guide
        </h2>
        <div className="flex h-fit">
          <div className="w-[50%]">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              Overview
            </h3>
            <div className="text-justify">
              Jira is a proprietary issue tracking product developed by
              Atlassian that allows bug tracking and agile project management.
              2waffles allows users to seamlessly interact with their Jira
              projects through a chatbot interface. By integrating Jira with our
              service, users can perform various actions such as creating,
              retrieving, and editing Jira issues dynamically. This page
              documents the the resources available for Jira on our platform, as
              well as a guideline for setting up the Jira resources on our
              'Actions' page.
              <br />
              <br />
              Before integrating Jira with 2waffles, you need a valid Atlassian
              account as well as a valid Jira API token. &nbsp;
              <br />
              <LinkPreview
                className="text-blue-600 font-semibold hover:opacity-80 transition-opacity"
                url="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/"
              >
                See here for more details.
              </LinkPreview>
            </div>
          </div>
          <div className="w-[50%] h-full flex justify-center items-center">
            <img
              src={JiraLogo}
              alt="Jira Logo"
              className="w-[30%] h-[30%] ml-10"
            />
          </div>
        </div>

        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Selecting the desired Jira Service:
        </h3>
        <p>
          When you want to create a new Jira action, select 'API' as your
          desired action type, then from the 'API Service' dropdown menu, select
          'JIRA' as your API service.
          <br />
          <br />
          <sup>
            As of v1.0 of 2waffles.ai, only the creation of Jira issues is
            supported.
          </sup>
        </p>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Create Jira Issue:
        </h3>
        <div>
          To create an action for enabling the creation of Jira issues using our
          service, follow these detailed steps to fill in the required fields:
          <ol className="list-decimal list-inside mt-5">
            <li className="mb-2">
              <span className="font-semibold">Action Name:</span> Provide a
              descriptive name for the action. The name should be in lowercase
              and use underscores (_) instead of whitespace.
              <br />
              <p className="ml-4 mt-2">
                Example: <code>create_jira_issue</code>
              </p>
            </li>
            <li className="mb-2">
              <span className="font-semibold">Description:</span> Enter a
              detailed description that clearly explains what the action does.
              This helps in understanding the purpose of the action at a glance.
              <br />
              <p className="ml-4 mt-2">
                Example:{" "}
                <code>Creates a Jira Issue with the given details.</code>
              </p>
            </li>
            <li className="mb-2">
              <span className="font-semibold">API Domain:</span> You need to
              input your specific Atlassian domain. This is the base URL for
              your Jira instance.
              <br />
              <p className="ml-4 mt-2">
                Example: If your Jira domain is{" "}
                <code>example.atlassian.net</code>, you would enter{" "}
                <code>https://example.atlassian.net</code>.
              </p>
            </li>
            <li className="mb-2">
              <span className="font-semibold">Auth Parameter Fields:</span> You
              will need to fill in one specific authentication parameters to
              authorize your Jira actions. This parameters ensure that the
              requests are authenticated and secure.
              <br />
              <ul className="list-disc list-inside mt-2 ml-4">
                <li className="mb-2">
                  <span className="font-semibold">Key:</span> Your Jira email
                  address. This is the email associated with your Jira account.
                  <p className="ml-4 mt-2">
                    Example: <code>user@example.com</code>
                  </p>
                </li>
                <li className="mb-2">
                  <span className="font-semibold">Value:</span> Your Jira API
                  token. This is a unique token generated by Atlassian that
                  allows you to authenticate your requests.
                  <p className="ml-4 mt-2">
                    Example: <code>your_api_token</code>
                  </p>
                </li>
              </ul>
              <p className="ml-4 font-medium text-xs">
                Note: It is crucial to have exactly one field when submitting
                the form, with the key being the correct email address and the
                value being a valid API key.
              </p>
            </li>
            <li className="mb-2">
              <span className="font-semibold">Input section:</span> You need to
              provide exactly two inputs to create a Jira issue. The inputs
              should be exactly <code>issue_title</code> and{" "}
              <code>issue_description</code>.
            </li>
            <li className="mb-2">
              <span className="font-semibold">Output section:</span> Leave the
              output section empty as it is not required.
            </li>
          </ol>
        </div>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Edit Jira Issue:
        </h3>
        <p>
          This service is not supported in the current version of 2waffles.ai.
          We are working on adding this feature in the future.
        </p>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Delete Jira Issue:
        </h3>
        <p>
          This service is not supported in the current version of 2waffles.ai.
          We are working on adding this feature in the future.
        </p>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Assign Jira Issue:
        </h3>
        <p>
          This service is not supported in the current version of 2waffles.ai.
          We are working on adding this feature in the future.
        </p>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Archive/Unarchive Jira Issue:
        </h3>
        <p className="mb-[50vh]">
          This service is not supported in the current version of 2waffles.ai.
          We are working on adding this feature in the future.
        </p>
      </div>
    </div>
  );
}
