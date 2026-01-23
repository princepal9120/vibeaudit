"use client";

import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { useEffect, useState } from "react";

export const TypewriterEffect = ({
    words,
    className,
    cursorClassName,
}: {
    words: {
        text: string;
        className?: string;
    }[];
    className?: string;
    cursorClassName?: string;
}) => {
    // Simple state machine for typewriter
    // words array -> flatten to letters -> render
    // BUT user wants a cycling effect: "for [Indie Hackers]", then delete, then "for [Vibe Coders]"
    // The provided code snippet below creates a static typewriter or one-time effect.
    // I will implement a cycling effect which is better for this use case.

    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const TYPING_SPEED = 100;
    const DELETING_SPEED = 50;
    const PAUSE_DURATION = 2000;

    useEffect(() => {
        const word = words[currentWordIndex].text;

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                setCurrentText(word.substring(0, currentText.length + 1));
                if (currentText.length === word.length) {
                    setTimeout(() => setIsDeleting(true), PAUSE_DURATION);
                }
            } else {
                // Deleting
                setCurrentText(word.substring(0, currentText.length - 1));
                if (currentText === "") {
                    setIsDeleting(false);
                    setCurrentWordIndex((prev) => (prev + 1) % words.length);
                }
            }
        }, isDeleting ? DELETING_SPEED : TYPING_SPEED);

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentWordIndex, words]);

    return (
        <div className={cn("inline-flex items-center", className)}>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
            >
                {currentText}
            </motion.span>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
                className={cn(
                    "inline-block rounded-sm w-[4px] h-8 md:h-12 bg-primary ml-1 align-middle",
                    cursorClassName
                )}
            ></motion.span>
        </div>
    );
};
