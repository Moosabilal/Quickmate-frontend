import React from "react";
import { StatCardProps } from "../../util/interface/IProvider";

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, prefix = '', suffix = '' }) => {
        const isPositive = change > 0;
        console.log(isPositive)

        return (
            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-2 md:mb-4">
                    <div className="p-1.5 md:p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg md:rounded-xl">
                        <div className="w-4 h-4 md:w-5 md:h-5">
                            {icon}
                        </div>
                    </div>

                </div>

                <div className="space-y-1">
                    <h3 className="text-xs md:text-sm font-medium text-gray-600">{title}</h3>
                    <p className="text-lg md:text-2xl font-bold text-gray-900">
                        {prefix}{value}{suffix}
                    </p>
                    {/* <div className="flex items-center space-x-1">
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
            )}
            <span className={`text-xs md:text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-xs md:text-sm text-gray-500 hidden sm:inline">vs last period</span>
          </div> */}
                </div>
            </div>
        );
    };