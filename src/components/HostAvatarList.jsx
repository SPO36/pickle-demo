const hosts = ['김종배', '침착맨', '송은이', '배상훈', '디바제시카', '김태균', '김지윤'];

function HostAvatarList() {
  return (
    <div>
      <div className="mb-4 font-bold text-2xl">이번주 인기 진행자</div>
      <div className="flex gap-4">
        {hosts.map((name, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="bg-base-100 border border-base-300 rounded-full w-40 h-40 overflow-hidden">
              {/* 여기에 이미지 있으면 <img src="..." className="w-full h-full object-cover" /> */}
            </div>
            <p className="mt-2 text-lg">{name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HostAvatarList;
