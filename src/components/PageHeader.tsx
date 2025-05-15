
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  highlightedWord?: string;
  description?: string;
}

const PageHeader = ({
  title,
  highlightedWord,
  description
}: PageHeaderProps) => {
  // If highlightedWord is provided, replace it with a gradient version in the title
  const renderTitle = () => {
    if (!highlightedWord) {
      return <span className="text-gradient">{title}</span>;
    }
    
    const parts = title.split(highlightedWord);
    
    if (parts.length === 1) {
      // If highlightedWord is not found in title, apply gradient to whole title
      return <span className="text-gradient">{title}</span>;
    }
    
    return (
      <>
        {parts[0]}
        <span className="text-gradient">{highlightedWord}</span>
        {parts[1] || ''}
      </>
    );
  };

  return (
    <motion.div
      className="text-center max-w-3xl mx-auto mb-6 md:mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl md:text-5xl font-bold mb-4">
        {renderTitle()}
      </h1>
      {description && (
        <p className="text-xl text-gray-300">
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default PageHeader;
