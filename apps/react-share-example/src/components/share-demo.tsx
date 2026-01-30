"use client";

import { HeadlessShareButton } from "@gracefullight/react-share";
import { Loader2, Share2 } from "lucide-react";
import {
  SiFacebook,
  SiKakao,
  SiLine,
  SiPinterest,
  SiThreads,
  SiWhatsapp,
  SiX,
} from "react-icons/si";

const shareData = {
  id: "example-1",
  title: "React Share Example",
  description: "Check out this awesome headless social sharing library!",
  url: "https://github.com/gracefullight/pkgs",
};

const kakaoOptions = {
  kakao: {
    jsKey: "YOUR_KAKAO_JS_KEY",
  },
};

const facebookOptions = {
  facebook: {
    appId: "YOUR_FACEBOOK_APP_ID",
  },
};

export default function ShareDemo() {
  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-semibold mb-6">Basic Usage</h2>
        <p className="text-gray-600 mb-6">Render prop pattern - full control over your UI</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HeadlessShareButton type="twitter" data={shareData}>
            {({ onClick, isLoading }) => (
              <button
                type="button"
                onClick={onClick}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <SiX className="w-5 h-5" />
                )}
                <span>{isLoading ? "Loading..." : "X"}</span>
              </button>
            )}
          </HeadlessShareButton>

          <HeadlessShareButton type="facebook" data={shareData} options={facebookOptions}>
            {({ onClick, isLoading }) => (
              <button
                type="button"
                onClick={onClick}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <SiFacebook className="w-5 h-5" />
                )}
                <span>{isLoading ? "SDK Loading..." : "Facebook"}</span>
              </button>
            )}
          </HeadlessShareButton>

          <HeadlessShareButton type="kakao" data={shareData} options={kakaoOptions}>
            {({ onClick, isLoading }) => (
              <button
                type="button"
                onClick={onClick}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <SiKakao className="w-5 h-5" />
                )}
                <span>{isLoading ? "SDK Loading..." : "Kakao"}</span>
              </button>
            )}
          </HeadlessShareButton>

          <HeadlessShareButton type="native" data={shareData}>
            {({ onClick, isLoading }) => (
              <button
                type="button"
                onClick={onClick}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Share2 className="w-5 h-5" />
                )}
                <span>{isLoading ? "Loading..." : "Native"}</span>
              </button>
            )}
          </HeadlessShareButton>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-semibold mb-6">Direct URL Strategies</h2>
        <p className="text-gray-600 mb-6">No SDK required - opens share dialog directly</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: "twitter" as const, label: "X", color: "bg-black", Icon: SiX },
            { type: "line" as const, label: "Line", color: "bg-green-500", Icon: SiLine },
            {
              type: "whatsapp" as const,
              label: "WhatsApp",
              color: "bg-green-600",
              Icon: SiWhatsapp,
            },
            {
              type: "pinterest" as const,
              label: "Pinterest",
              color: "bg-red-600",
              Icon: SiPinterest,
            },
            { type: "threads" as const, label: "Threads", color: "bg-gray-900", Icon: SiThreads },
          ].map(({ type, label, color, Icon }) => (
            <HeadlessShareButton key={type} type={type} data={shareData}>
              {({ onClick, isLoading }) => (
                <button
                  type="button"
                  onClick={onClick}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 ${color} text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer`}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {!isLoading && <Icon className="w-4 h-4" />}
                  <span>{isLoading ? "Loading..." : label}</span>
                </button>
              )}
            </HeadlessShareButton>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-semibold mb-6">Link Copy</h2>
        <p className="text-gray-600 mb-6">Copy URL to clipboard</p>

        <HeadlessShareButton
          type="link"
          data={shareData}
          listeners={{
            onCopySuccess: () => alert("Link copied to clipboard!"),
            onShareError: (error) => alert(`Error: ${error}`),
          }}
        >
          {({ onClick, isLoading }) => (
            <button
              type="button"
              onClick={onClick}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
              <span>{isLoading ? "Copying..." : "Copy Link"}</span>
            </button>
          )}
        </HeadlessShareButton>
      </section>

      <section className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-semibold mb-6">Dynamic URL</h2>
        <p className="text-gray-600 mb-6">Async URL resolution - fetch shareable URL on click</p>

        <HeadlessShareButton
          type="twitter"
          data={{
            ...shareData,
            url: async () => {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              return "https://github.com/gracefullight/pkgs";
            },
          }}
        >
          {({ onClick, isLoading }) => (
            <button
              type="button"
              onClick={onClick}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <SiX className="w-5 h-5" />
              )}
              <span>{isLoading ? "Resolving URL..." : "Share with Dynamic URL"}</span>
            </button>
          )}
        </HeadlessShareButton>
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">Features</h2>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>
              <strong>Headless</strong> - Total control over your UI
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>
              <strong>Performance</strong> - SDKs loaded only when needed
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>
              <strong>Strategy Pattern</strong> - Easy to extend
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>
              <strong>Native Share</strong> - Web Share API support
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>
              <strong>Dynamic URLs</strong> - Async URL resolution
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
