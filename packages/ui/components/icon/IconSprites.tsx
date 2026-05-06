import SVG from "react-inlinesvg";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const vercelCommitHash = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
const commitHash = vercelCommitHash ? `-${vercelCommitHash.slice(0, 7)}` : "";

export function IconSprites() {
  return (
    <SVG
      src={`/icons/sprite.svg?v=${process.env.NEXT_PUBLIC_CALCOM_VERSION}-${commitHash}`}
    />
  );
}

export default IconSprites;
