import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Eye, EyeClosed } from "lucide-react";

interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {label && (
          <label
            className={cn(
              "block text-[16px] font-medium opacity-70 mb-2",
              isFocused ? "text-primary" : "text-primary"
            )}>
            {label}
          </label>
        )}
        <div className="relative">
          <motion.input
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            type={showPassword ? "text" : type}
            className={cn(
              "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-backgrund placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoComplete={type === "password" ? "current-password" : undefined}
            {...props}
          />
          {type === "password" && (
            <motion.button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-sm font-medium text-gray-700 bg-gray-200 my-1 mx-1 rounded-md transition-all duration-200 hover:bg-gray-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }
);
Input.displayName = "Input";

export { Input };
