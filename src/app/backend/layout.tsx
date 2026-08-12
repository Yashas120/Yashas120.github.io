/**
 * The route owns a fixed near-black operations palette rather than following the
 * site-wide light theme, so the canvas is painted before hydration. A stylesheet
 * is injected (rather than inline attributes) so React's hydration attribute
 * check is not tripped — the same approach /cluster uses.
 */
const canvasInit = `(function(){try{var s=document.createElement('style');s.setAttribute('data-backend-canvas','');s.appendChild(document.createTextNode('html,body{background-color:#070B10;}'));document.head.appendChild(s);}catch(e){}})();`;

export default function BackendLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: canvasInit }} />
      {children}
    </>
  );
}
