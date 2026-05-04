use anyhow::Result;
use serde_json::Value;
use std::collections::HashMap;

#[derive(Debug, Clone)]
enum Statement {
    Print(String),
    Let(String, String),
    If {
        variable: String,
        equals: String,
        then_stmt: Box<Statement>,
    },
    For {
        variable: String,
        start: i64,
        end: i64,
        body: Box<Statement>,
    },
    Noop,
}

pub struct UCodeRuntime {
    variables: HashMap<String, Value>,
}

impl UCodeRuntime {
    pub fn new() -> Self {
        Self {
            variables: HashMap::new(),
        }
    }

    pub fn execute(&mut self, code: &str) -> Result<String> {
        let mut out = String::new();
        for line in code.lines() {
            let stmt = self.parse_line(line);
            out.push_str(&self.execute_statement(stmt)?);
        }
        Ok(out)
    }

    fn parse_line(&self, line: &str) -> Statement {
        let t = line.trim();
        if let Some(rest) = t.strip_prefix("PRINT ") {
            return Statement::Print(rest.to_string());
        }
        if let Some(rest) = t.strip_prefix("LET ") {
            if let Some((k, v)) = rest.split_once('=') {
                return Statement::Let(k.trim().to_string(), v.trim().to_string());
            }
        }
        if let Some(rest) = t.strip_prefix("IF ") {
            if let Some((cond, rhs)) = rest.split_once(" THEN ") {
                if let Some((var, eq)) = cond.split_once("==") {
                    return Statement::If {
                        variable: var.trim().to_string(),
                        equals: eq.trim().trim_matches('"').to_string(),
                        then_stmt: Box::new(self.parse_line(rhs)),
                    };
                }
            }
        }
        if let Some(rest) = t.strip_prefix("FOR ") {
            // FOR i=1..3 DO PRINT "x"
            if let Some((range, body)) = rest.split_once(" DO ") {
                if let Some((var, span)) = range.split_once('=') {
                    if let Some((start, end)) = span.split_once("..") {
                        let start = start.trim().parse().unwrap_or(0);
                        let end = end.trim().parse().unwrap_or(0);
                        return Statement::For {
                            variable: var.trim().to_string(),
                            start,
                            end,
                            body: Box::new(self.parse_line(body)),
                        };
                    }
                }
            }
        }
        Statement::Noop
    }

    fn execute_statement(&mut self, stmt: Statement) -> Result<String> {
        match stmt {
            Statement::Print(args) => Ok(format!("{}\n", self.execute_print(&args))),
            Statement::Let(name, raw) => {
                let val = raw.trim_matches('"').to_string();
                self.variables.insert(name, Value::String(val));
                Ok(String::new())
            }
            Statement::If {
                variable,
                equals,
                then_stmt,
            } => {
                let current = self
                    .variables
                    .get(&variable)
                    .and_then(Value::as_str)
                    .unwrap_or_default()
                    .to_string();
                if current == equals {
                    self.execute_statement(*then_stmt)
                } else {
                    Ok(String::new())
                }
            }
            Statement::For {
                variable,
                start,
                end,
                body,
            } => {
                let mut out = String::new();
                for i in start..=end {
                    self.variables
                        .insert(variable.clone(), Value::String(i.to_string()));
                    out.push_str(&self.execute_statement((*body).clone())?);
                }
                Ok(out)
            }
            Statement::Noop => Ok(String::new()),
        }
    }

    fn execute_print(&mut self, args: &str) -> String {
        let mut out = args.trim().trim_matches('"').to_string();
        for (k, v) in &self.variables {
            if let Some(s) = v.as_str() {
                out = out.replace(&format!("${{{k}}}"), s);
            }
        }
        out
    }
}
