<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

final class HomeController extends AbstractController
{
    public function __construct(private UserService $userService) {}

    #[Route('/', name: 'home', methods: ['GET'])]
    public function index(): Response
    {
        $users = $this->userService->listUsers();

        return $this->render('home.html.twig', [
            'users' => $users,
            'userCount' => count($users),
        ]);
    }
}
