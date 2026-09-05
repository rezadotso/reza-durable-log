import { renderWeekHtml } from "@/lib/render-week";

export const dynamic = "force-static";

export default function Page() {
  return (
    <>
      <div
        className="wrap"
        id="app"
        dangerouslySetInnerHTML={{ __html: renderWeekHtml() }}
      />
      <div className="toast" id="toast" />
    </>
  );
}
