/**
 * 节流函数 - 限制函数在一定时间内只能执行一次
 * @param fn 需要节流的函数
 * @param minInterval 最小执行间隔时间(毫秒),默认1000ms
 * @param options 配置选项
 * @param options.leading 是否在延迟开始前执行
 * @param options.trailing 是否在延迟结束后执行
 * @returns 经过节流处理的函数
 */
export function throttle<T extends unknown[]>(
  fn: (...args: T) => unknown,
  minInterval = 1000,
  options = {
    leading: false,
    trailing: false,
  }
) {
  // 是否是第一次调用的标志
  let first = true;
  // 上次执行时间
  let lastCallTime = Date.now();
  // 定时器引用
  let timer: ReturnType<typeof setTimeout>;

  return function (this: unknown, ...args: T) {
    // 当前时间
    const curTime = Date.now();
    const { leading, trailing } = options;

    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer);
    }

    // 首次调用的特殊处理
    if (first) {
      if (leading) {
        // leading为true时立即执行
        fn.apply(this, args);
        lastCallTime = curTime;
      } else if (trailing) {
        // trailing为true时延迟执行
        timer = setTimeout(() => {
          fn.apply(this, args);
          lastCallTime = curTime;
        }, minInterval);
      }
      first = false;
      return;
    }

    // 判断是否超过最小间隔时间
    if (curTime - lastCallTime > minInterval) {
      fn.apply(this, args);
      lastCallTime = curTime;
    }

    // trailing为true时,设置定时器在间隔结束后执行
    if (trailing) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        lastCallTime = curTime;
      }, minInterval);
    }
  };
}
