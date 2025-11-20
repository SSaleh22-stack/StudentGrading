"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const navItems = [
    {
      label: t("personalInfo.title"),
      href: "/dashboard/personal-info",
    },
    {
      label: t("files.myFiles"),
      href: "/dashboard/files",
    },
    {
      label: t("subscription.title"),
      href: "/dashboard/subscription",
    },
  ];

  return (
    <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <ul className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600 rtl:border-r-0 rtl:border-l-4 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:scale-[1.02] hover:shadow-sm"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

