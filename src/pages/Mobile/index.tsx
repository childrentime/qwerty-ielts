import logo from '@/assets/logo.svg'
import Footer from '@/components/Footer'

export default function MobilePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center dark:bg-gray-900">
      <img src={logo} alt="Qwerty Learner Logo" className="h-20 w-20" />
      <h1 className="text-3xl font-bold text-indigo-500">Qwerty IELTS</h1>
      <p className="max-w-md text-lg text-gray-600 dark:text-gray-300">用键盘练习雅思词汇，边打字边记忆。</p>
      <p className="max-w-md text-sm leading-7 text-gray-500 dark:text-gray-400">
        请在电脑浏览器中打开本站开始练习。平板电脑可连接外接键盘，并使用桌面版网页。
      </p>
      <Footer />
    </main>
  )
}
