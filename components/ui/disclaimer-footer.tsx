export function DisclaimerFooter() {
  return (
    <footer className="border-t border-[#E8E6E0] bg-[#F4F4F1] px-6 py-5 text-center text-xs text-navy-400">
      <p>
        This platform provides general educational information only and does not constitute financial,
        legal, or tax advice. Consult a qualified adviser for guidance specific to your circumstances.
      </p>
      <p className="mt-2 text-navy-300">
        © {new Date().getFullYear()} Bitcoin Treasury Solutions
      </p>
    </footer>
  );
}
