"use client";

import { motion, useInView, HTMLMotionProps } from "framer-motion";
import { useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
    direction?: "up" | "down" | "left" | "right" | "none";
    fullWidth?: boolean;
}

export function FadeIn({
    children,
    delay = 0,
    duration = 0.5,
    className,
    direction = "up",
    fullWidth = false,
    ...props
}: FadeInProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const variants = {
        hidden: {
            opacity: 0,
            y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
            x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
                duration,
                delay,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ease: [0.21, 0.47, 0.32, 0.98] as any, // smooth cubic-bezier
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            className={cn(fullWidth ? "w-full" : "", className)}
            {...props}
        >
            {children}
        </motion.div>
    );
}

interface StaggerProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    delay?: number;
    staggerChildren?: number;
    className?: string;
}

export function Stagger({
    children,
    delay = 0,
    staggerChildren = 0.1,
    className,
    ...props
}: StaggerProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const variants = {
        hidden: {},
        visible: {
            transition: {
                delayChildren: delay,
                staggerChildren,
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function ScaleIn({
    children,
    delay = 0,
    duration = 0.4,
    className,
    ...props
}: FadeInProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration,
                delay,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ease: [0.21, 0.47, 0.32, 0.98] as any,
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * A handy floating animation for hero images/elements
 */
export function FloatingElement({
    children,
    delay = 0,
    className,
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            animate={{
                y: [0, -15, 0],
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay,
            }}
        >
            {children}
        </motion.div>
    );
}
