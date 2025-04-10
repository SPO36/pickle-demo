function PodcastCard({ title, subtitle }) {
  return (
    <div className="bg-base-100 border border-base-300 w-80 overflow-hidden card">
      <div className="bg-base-300 h-44"></div>
      <div className="p-3">
        <p className="text-md text-base-500">{subtitle}</p>
        <h3 className="font-semibold text-xl">{title}</h3>
      </div>
    </div>
  );
}

export default PodcastCard;
