import React from 'react';

const Icons = {
  Server: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>,
  GitMerge: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M6 21V9a9 9 0 0 0 9 9"></path></svg>,
  Zap: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  ShieldCheck: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
};

export default function Dashboard() {
  const stats = [
    { label: 'Active Environments', value: '12', icon: Icons.Server, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    { label: 'Pending Syncs', value: '3', icon: Icons.GitMerge, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    { label: 'System Health', value: '98%', icon: Icons.Zap, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/20' },
  ];

  const features = [
    {
      title: "Environment Templates",
      desc: "Standardize your development setups with reproducible blueprints.",
      icon: Icons.Server,
    },
    {
      title: "Dependency Management",
      desc: "Track and synchronize package versions across your entire team.",
      icon: Icons.GitMerge,
    },
    {
      title: "Configuration Sync",
      desc: "Securely share and manage environment variables and config files.",
      icon: Icons.Zap,
    },
    {
      title: "Health Monitoring",
      desc: "Real-time insights into the performance of your local and remote envs.",
      icon: Icons.ShieldCheck,
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-lg">Overview of your development ecosystem.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-xl border backdrop-blur-md bg-white/5 ${stat.border} hover:-translate-y-1 transition-transform duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions / Feature Preview */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white/90">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="group relative p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#3B82F6]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#0F172A] border border-white/10 group-hover:border-[#3B82F6] group-hover:text-[#3B82F6] transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-slate-300 group-hover:text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
