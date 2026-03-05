import { useNavigate } from 'react-router-dom'
import { useConversationStore } from '../stores/conversationStore'

export function HistoryPage() {
  const navigate = useNavigate()
  const conversations = useConversationStore((s) => s.conversationHistory)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="mr-3 text-gray-600 hover:text-gray-900"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-900">Consultation History</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No consultations yet</p>
          <button
            onClick={() => navigate('/ar-session')}
            className="text-primary-500 font-medium hover:underline"
          >
            Start your first consultation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div key={conv.id} className="bg-white rounded-xl p-4 shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {new Date(conv.startedAt).toLocaleDateString()}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    conv.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : conv.status === 'active'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {conv.status}
                </span>
              </div>
              {conv.summary && (
                <p className="text-sm text-gray-600 mb-2">{conv.summary}</p>
              )}
              <div className="flex flex-wrap gap-1">
                {conv.topics.map((topic) => (
                  <span
                    key={topic}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {conv.messageCount} messages
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
