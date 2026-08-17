package es.elniu.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@ConfigurationPropertiesScan
// Para que el aviso por correo de una reserva no haga esperar al cliente.
@EnableAsync
public class ElniuApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(ElniuApiApplication.class, args);
    }
}
