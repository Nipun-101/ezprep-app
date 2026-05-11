import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ExamCardProps {
  id: string;
  name: string;
  shortName: string;
  imageUrl: string;
  categoryName: string;
  categoryShortName: string;
}

export default function ExamCard({ name, shortName, imageUrl, categoryName, categoryShortName }: ExamCardProps) {
  const router = useRouter();
  const title = `${categoryShortName} ${shortName}`;
  const showSubtitle = title.trim().toLowerCase() !== name.trim().toLowerCase();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-1 group cursor-pointer">
      <div className="flex items-start space-x-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50">
          <Image
            src={imageUrl}
            alt={categoryName}
            width={56}
            height={56}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 text-base group-hover:text-teal-600 transition-colors leading-tight">
            {title}
          </h3>
          {showSubtitle && (
            <p className="text-gray-500 text-sm mt-0.5 leading-snug line-clamp-2">{name}</p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-400 truncate">{categoryName}</span>
        <button
          onClick={() => router.push('/login')}
          className="text-xs text-teal-600 font-medium group-hover:underline flex-shrink-0 ml-2"
        >
          View Tests →
        </button>
      </div>
    </div>
  );
}
