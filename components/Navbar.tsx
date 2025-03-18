"use client";

import React from "react";
import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

const menuItems = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/request", label: "ยื่นคำร้อง" },
  { href: "/allrequests", label: "ดูคำร้อง" },
];

export default function Navbar() {
  return (
    <nav className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold">
              ระบบขอลาหยุด
            </Link>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-gray-200"
              >
                {item.label}
              </Link>
            ))}
          </div>
          {/* Mobile Menu Button using Drawer */}
          <div className="md:hidden">
            <Drawer>
              <DrawerTrigger asChild>
                <button className="inline-flex items-center justify-center p-2 rounded-md 0 focus:outline-none ">
                  <span className="sr-only">Open menu</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </DrawerTrigger>
              <DrawerContent className="">
                <DrawerHeader>
                  <DrawerTitle className="text-xl font-bold">Menu</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col space-y-4 mt-4">
                  {menuItems.map((item) => (
                    <DrawerClose asChild key={item.href}>
                      <Link href={item.href} className="block px-4 py-2 0">
                        {item.label}
                      </Link>
                    </DrawerClose>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </nav>
  );
}
